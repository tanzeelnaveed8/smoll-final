import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from 'src/guards/role/role.enum';
import { ProductService } from 'src/modules/product/product.service';
import { Logger } from 'src/configs/logger';
import axios from 'axios';

export class NutritionRecommendationsBodyDto {
  species?: string;
  breed?: string;
  age?: number;
  weight?: number;
  preExistingConditions?: string;
  petId?: string;
  healthRecords?: { name: string; description: string; date: string }[];
}

export class NutritionRecommendationsResDto {
  productIds: string[];
}

@ApiTags('Member: AI')
@Controller('/member/ai')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
export class MemberAiController {
  private readonly logger = Logger.getInstance();

  constructor(private readonly productService: ProductService) {}

  @Post('nutrition-recommendations')
  async getNutritionRecommendations(
    @Body() body: NutritionRecommendationsBodyDto,
  ): Promise<NutritionRecommendationsResDto> {
    const catalog = await this.productService.findAll({ page: 1, limit: 50 });
    const products = catalog.data ?? [];
    const allIds = products.map((p) => p.id);

    if (!allIds.length) {
      this.logger.info('[AI_PICKS] No products in catalog, returning empty');
      return { productIds: [] };
    }

    const apiKey =
      process.env.SMOLL_AI_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      this.logger.warn('[AI_PICKS] No OpenAI API key configured');
      return { productIds: [] };
    }

    try {
      const petContext = this.buildPetContext(body);

      const productCatalog = products
        .map(
          (p) =>
            `{ "id": "${p.id}", "name": "${p.name}", "category": "${p.category ?? 'general'}", "price": ${p.price}, "description": "${p.description ?? ''}" }`,
        )
        .join(',\n');

      const systemPrompt = `You are a veterinary nutrition expert. Based on the pet's full profile including breed, age, weight, health conditions, and medical history (vaccines, incidents, etc.), recommend the most suitable products from the catalog.

RULES:
- Return ONLY a valid JSON array of product ID strings, nothing else
- Pick 3-5 products that best match the pet's needs
- Consider the pet's medical history: if they had recent incidents or are missing vaccines, prioritize relevant supplements or health products
- If the pet has pre-existing conditions, prioritize products that help with those conditions
- If no pet context is provided, pick 3-5 generally popular/recommended products
- Do NOT include any explanation, markdown, or extra text`;

      const userPrompt = `Pet profile:
${petContext}

Product catalog:
[${productCatalog}]

Return the recommended product IDs as a JSON array:`;

      this.logger.info(
        `[AI_PICKS] Requesting recommendations for pet: ${body.petId ?? 'no-pet'}`,
      );

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 200,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      );

      const content: string =
        response.data?.choices?.[0]?.message?.content?.trim() ?? '[]';

      this.logger.info(`[AI_PICKS] Raw OpenAI response: ${content}`);

      const candidateIds = this.parseProductIds(content);
      const validIds = candidateIds.filter((id) => allIds.includes(id));

      this.logger.info(
        `[AI_PICKS] Candidates: ${candidateIds.length}, Valid: ${validIds.length}`,
      );

      if (!validIds.length) {
        this.logger.warn(
          `[AI_PICKS] No valid IDs matched. Candidates: ${JSON.stringify(candidateIds)}, Available: ${JSON.stringify(allIds.slice(0, 5))}...`,
        );
        return { productIds: [] };
      }

      return { productIds: validIds.slice(0, 5) };
    } catch (err) {
      const message =
        axios.isAxiosError(err)
          ? `${err.response?.status} - ${JSON.stringify(err.response?.data ?? err.message)}`
          : err?.message ?? 'Unknown error';
      this.logger.error(`[AI_PICKS] OpenAI request failed: ${message}`);
      return { productIds: [] };
    }
  }

  private buildPetContext(body: NutritionRecommendationsBodyDto): string {
    const parts: string[] = [];
    if (body.species) parts.push(`Species: ${body.species}`);
    if (body.breed) parts.push(`Breed: ${body.breed}`);
    if (body.age != null) parts.push(`Age: ${body.age}`);
    if (body.weight != null) parts.push(`Weight: ${body.weight} kg`);
    if (body.preExistingConditions)
      parts.push(`Pre-existing conditions: ${body.preExistingConditions}`);

    if (body.healthRecords?.length) {
      const records = body.healthRecords
        .map((r) => `  - ${r.name}: ${r.description} (${r.date})`)
        .join('\n');
      parts.push(`Medical history (vaccines/incidents):\n${records}`);
    }

    return parts.length
      ? parts.join('\n')
      : 'No specific pet information provided. Recommend generally popular products.';
  }

  private parseProductIds(content: string): string[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\[[\s\S]*?\]/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          this.logger.error(
            `[AI_PICKS] Could not parse extracted array: ${match[0]}`,
          );
          return [];
        }
      } else {
        this.logger.error(
          `[AI_PICKS] No JSON array found in response: ${content}`,
        );
        return [];
      }
    }

    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  }
}
