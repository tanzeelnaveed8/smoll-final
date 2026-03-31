<template>
  <v-sheet class="d-flex justify-center">
    <div class="px-6 py-6 d-flex flex-column gr-6 w-100" style="max-width: 1140px">
      <v-sheet class="d-flex justify-space-between w-100">
        <v-sheet class="d-flex align-center gc-4">
          <UtilityBar path="/products" />
        </v-sheet>
        <v-btn color="grey1" class="text-body-2 px-2" prepend-icon="$tb-plus" density="comfortable" @click="openAddDialog">
          <template v-slot:prepend>
            <v-icon icon="$tb-plus" size="20" style="margin-right: -4px" />
          </template>
          New Product
        </v-btn>
      </v-sheet>
      <v-sheet class="d-flex flex-column gr-6">
        <v-table class="text-body-2" style="border: 1px solid #dde7ee; border-radius: 8px">
          <thead>
            <tr>
              <th class="font-weight-bold" style="width: 48px">Image</th>
              <th class="font-weight-bold">Name</th>
              <th class="font-weight-bold">Description</th>
              <th class="font-weight-bold">Price</th>
              <th class="font-weight-bold">Stock</th>
              <th class="font-weight-bold">Category</th>
              <th class="font-weight-bold">Status</th>
              <th class="font-weight-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-6">
                <v-progress-circular indeterminate color="primary" size="24" />
              </td>
            </tr>
            <tr v-else-if="!products.length">
              <td colspan="8" class="text-center py-6 text-grey2">No products found</td>
            </tr>
            <tr v-for="product in products" :key="product.id" class="cursor-pointer" @click="editProduct(product)">
              <td class="pa-2">
                <v-avatar v-if="product.imageUrl" size="40" rounded>
                  <v-img :src="product.imageUrl" cover referrerpolicy="no-referrer" />
                </v-avatar>
                <v-avatar v-else size="40" rounded color="grey-lighten-2">
                  <v-icon icon="$tb-file-certificate" size="20" />
                </v-avatar>
              </td>
              <td class="font-weight-bold">{{ product.name }}</td>
              <td>{{ product.description || '-' }}</td>
              <td>{{ product.price }} {{ product.currency }}</td>
              <td>{{ product.stock }}</td>
              <td>{{ product.category || '-' }}</td>
              <td>
                <v-chip :color="product.isActive ? 'success' : 'error'" size="small">
                  {{ product.isActive ? 'Active' : 'Inactive' }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-btn icon variant="text" size="small" @click.stop="confirmDelete(product)">
                  <v-icon icon="$tb-x" size="18" color="error" />
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
        <TableFooter :maxValue path="/products" />
      </v-sheet>
    </div>
  </v-sheet>

  <!-- Add/Edit Dialog -->
  <v-dialog v-model="showAddDialog" width="560" persistent>
    <v-card class="product-form-card">
      <v-card-title class="text-h6 font-weight-bold pa-5 pb-0">
        {{ editingProduct ? 'Edit Product' : 'Add Product' }}
      </v-card-title>
      <v-card-text class="pa-5 pt-4">
        <v-form class="product-form" @submit.prevent="handleSave">
          <v-text-field
            v-model="formData.name"
            label="Name"
            :rules="[v => !!v || 'Name is required']"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="mb-3"
          />
          <v-textarea
            v-model="formData.description"
            label="Description"
            rows="3"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="mb-3"
          />
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model.number="formData.price"
                label="Price"
                type="number"
                min="0"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="mb-3"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="formData.stock"
                label="Stock"
                type="number"
                min="0"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="mb-3"
              />
            </v-col>
          </v-row>
          <v-text-field
            v-model="formData.category"
            label="Category"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="mb-3"
          />
          <v-sheet class="mb-3">
            <p class="text-caption text-medium-emphasis mb-2">Images</p>
            <v-text-field
              v-model="formData.imageUrl"
              label="Primary image URL"
              placeholder="https://..."
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="mb-2"
              clearable
            />
            <v-file-input
              :key="fileInputKey"
              :model-value="formData.imageFile"
              label="Upload images"
              prepend-icon=""
              prepend-inner-icon="$tb-cloud-upload"
              accept="image/*"
              multiple
              density="compact"
              variant="outlined"
              hide-details="auto"
              show-size
              clearable
              @update:model-value="onProductImageSelect"
            />
            <!-- Primary preview -->
            <v-sheet
              v-if="productPreviewSrc"
              class="mt-2 d-flex align-center"
            >
              <v-img
                :key="productPreviewSrc"
                :src="productPreviewSrc"
                alt="Preview"
                class="product-image-primary"
                cover
                referrerpolicy="no-referrer"
                @error="previewError = true"
                @load="previewError = false"
              />
              <span
                v-if="previewError && formData.imageUrl"
                class="text-caption text-medium-emphasis"
              >
                Preview unavailable (URL saved)
              </span>
            </v-sheet>

            <!-- Gallery thumbnails -->
            <v-sheet
              v-if="formData.imageGallery && formData.imageGallery.length"
              class="mt-3 product-gallery"
            >
              <div
                v-for="(url, idx) in formData.imageGallery"
                :key="url + idx"
                class="product-gallery-item"
              >
                <v-img
                  :src="url"
                  class="product-image-preview"
                  cover
                  referrerpolicy="no-referrer"
                  @click="
                    () => {
                      formData.imageUrl = url
                    }
                  "
                  style="cursor: pointer"
                />
                <v-chip
                  v-if="formData.imageUrl === url"
                  size="x-small"
                  color="primary"
                  variant="elevated"
                  class="mt-1 product-gallery-primary-chip"
                >
                  Primary
                </v-chip>
                <v-btn
                  icon
                  size="x-small"
                  variant="flat"
                  color="error"
                  class="product-gallery-remove-btn"
                  @click.stop="
                    () => {
                      formData.imageGallery = formData.imageGallery.filter((u, i) => i !== idx)
                      if (formData.imageUrl === url) {
                        formData.imageUrl = formData.imageGallery[0] || ''
                      }
                    }
                  "
                >
                  <v-icon icon="$tb-x" size="14" />
                </v-btn>
              </div>
            </v-sheet>
          </v-sheet>

          <!-- Bundle Options section -->
          <v-sheet class="mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-body-2 font-weight-bold">Bundle Options</span>
              <v-btn size="small" variant="tonal" color="primary" @click="addBundleOption">+ Add bundle</v-btn>
            </div>
            <v-sheet v-if="formData.bundleOptions.length === 0" class="text-body-2 text-grey2 py-2">No bundle options yet</v-sheet>
            <v-sheet v-for="(bundle, bundleIdx) in formData.bundleOptions" :key="bundleIdx" class="mb-3 pa-3" style="border: 1px solid #e0e0e0; border-radius: 8px">
              <div class="d-flex align-center gc-2 mb-2">
                <v-text-field
                  v-model="bundle.label"
                  label="Label (e.g., 2x Pack)"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="flex: 2"
                />
                <v-text-field
                  v-model="bundle.badge"
                  label="Badge (e.g., Save 5%)"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="flex: 1.5"
                  placeholder="Optional"
                />
                <v-text-field
                  v-model.number="bundle.multiplier"
                  label="Multiplier"
                  type="number"
                  step="0.1"
                  min="0"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="flex: 1"
                />
                <v-btn icon variant="text" size="small" @click="removeBundleOption(bundleIdx)">
                  <v-icon icon="$tb-x" size="16" color="error" />
                </v-btn>
              </div>
            </v-sheet>
          </v-sheet>

          <!-- Delivery Offers section -->
          <v-sheet class="mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-body-2 font-weight-bold">Delivery Offers</span>
              <v-btn size="small" variant="tonal" color="primary" @click="addDeliveryOffer">+ Add offer</v-btn>
            </div>
            <v-sheet v-if="formData.deliveryOffers.length === 0" class="text-body-2 text-grey2 py-2">No delivery offers yet</v-sheet>
            <v-sheet v-for="(offer, offerIdx) in formData.deliveryOffers" :key="offerIdx" class="mb-3 pa-3" style="border: 1px solid #e0e0e0; border-radius: 8px">
              <div class="d-flex align-center gc-2">
                <v-text-field
                  v-model="offer.icon"
                  label="Icon (emoji or name)"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="flex: 1"
                  placeholder="🚚"
                />
                <v-text-field
                  v-model="offer.text"
                  label="Text"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="flex: 3"
                  placeholder="Free delivery on orders over AED 100"
                />
                <v-btn icon variant="text" size="small" @click="removeDeliveryOffer(offerIdx)">
                  <v-icon icon="$tb-x" size="16" color="error" />
                </v-btn>
              </div>
            </v-sheet>
          </v-sheet>

          <!-- Tags section -->
          <v-sheet class="mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-body-2 font-weight-bold">Tags</span>
              <v-btn size="small" variant="tonal" color="primary" @click="addTag">+ Add tag</v-btn>
            </div>
            <v-sheet v-if="formData.tags.length === 0" class="text-body-2 text-grey2 py-2">No tags yet</v-sheet>
            <v-sheet v-for="(tag, tagIdx) in formData.tags" :key="tagIdx" class="mb-3 pa-3" style="border: 1px solid #e0e0e0; border-radius: 8px">
              <div class="d-flex align-center gc-2">
                <v-text-field
                  v-model="tag.icon"
                  label="Icon (emoji or name)"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="flex: 1"
                  placeholder="✓"
                />
                <v-text-field
                  v-model="tag.text"
                  label="Text"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="flex: 2"
                  placeholder="Vet approved"
                />
                <v-text-field
                  v-model="tag.color"
                  label="Color (hex)"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="flex: 1"
                  placeholder="#22C55E"
                />
                <v-btn icon variant="text" size="small" @click="removeTag(tagIdx)">
                  <v-icon icon="$tb-x" size="16" color="error" />
                </v-btn>
              </div>
            </v-sheet>
          </v-sheet>

          <v-switch v-if="editingProduct" v-model="formData.isActive" label="Active" color="primary" hide-details class="mb-3" />
          <v-sheet class="d-flex gap-3 justify-end pt-2">
            <v-btn variant="outlined" @click="showAddDialog = false">Cancel</v-btn>
            <v-btn color="primary" :loading="saving" :disabled="uploading" @click="handleSave">
              {{ uploading ? 'Uploading image...' : 'Save' }}
            </v-btn>
          </v-sheet>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Delete Confirmation -->
  <v-dialog v-model="showDeleteDialog" width="400">
    <v-card class="pa-6">
      <h3 class="mb-4">Delete Product</h3>
      <p>Are you sure you want to delete "{{ deletingProduct?.name }}"?</p>
      <v-sheet class="d-flex gc-3 justify-end mt-4">
        <v-btn variant="outlined" @click="showDeleteDialog = false">Cancel</v-btn>
        <v-btn color="error" :loading="deleting" @click="handleDelete">Delete</v-btn>
      </v-sheet>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import UtilityBar from '@/components/partials/UtilityBar.vue'
import TableFooter from '@/components/partials/table/TableFooter.vue'
import { useProductStore } from '@/stores/product'
import { useUploadStore } from '@/stores/upload'
import { computed, ref, watchEffect } from 'vue'
import { useRoute, type LocationQueryValue } from 'vue-router'
import { toast } from 'vue3-toastify'

const route = useRoute()
const productStore = useProductStore()

const products = ref<any[]>([])
const loading = ref(false)
const maxValue = ref(0)
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const uploading = ref(false)
const editingProduct = ref<any>(null)
const deletingProduct = ref<any>(null)
const previewError = ref(false)
const previewObjectUrl = ref<string | null>(null)
const fileInputKey = ref(0)

const productPreviewSrc = computed(
  () => formData.value.imageUrl?.trim() || previewObjectUrl.value || ''
)

const formData = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  imageUrl: '',
  imageFile: null as File[] | null,
  imageGallery: [] as string[],
  isActive: true,
  bundleOptions: [] as { id: string; label: string; badge?: string; multiplier: number; priceDelta: number }[],
  deliveryOffers: [] as { icon: string; text: string }[],
  tags: [] as { icon: string; text: string; color?: string }[],
})

const addBundleOption = () => {
  formData.value.bundleOptions.push({ id: `bundle-${Date.now()}`, label: '', badge: '', multiplier: 1, priceDelta: 0 })
}

const removeBundleOption = (index: number) => {
  formData.value.bundleOptions.splice(index, 1)
}

const addDeliveryOffer = () => {
  formData.value.deliveryOffers.push({ icon: '', text: '' })
}

const removeDeliveryOffer = (index: number) => {
  formData.value.deliveryOffers.splice(index, 1)
}

const addTag = () => {
  formData.value.tags.push({ icon: '', text: '', color: '' })
}

const removeTag = (index: number) => {
  formData.value.tags.splice(index, 1)
}

const getProducts = async (search?: string, page?: number) => {
  try {
    loading.value = true
    const pageNum = page != null && Number(page) >= 1 ? Number(page) : 1
    const searchStr = search != null ? String(search).trim() : ''
    const result = await productStore.fetchProducts(searchStr || undefined, pageNum)
    products.value = result?.data ?? []
    const total = result?.count ?? 0
    maxValue.value = Math.max(1, Math.ceil(total / 10))
  } catch {
    products.value = []
    maxValue.value = 1
    toast.error('Failed to load products')
  } finally {
    loading.value = false
  }
}

const editProduct = async (product: any) => {
  if (previewObjectUrl.value) {
    URL.revokeObjectURL(previewObjectUrl.value)
    previewObjectUrl.value = null
  }
  editingProduct.value = product
  previewError.value = false

  // Try to load full product details so that imageGallery is available
  let full: any = null
  try {
    full = await productStore.fetchProductDetails(product.id)
  } catch {
    full = null
  }

  const source = full || product
  const imageUrl = source.imageUrl || product.imageUrl || ''
  const galleryFromApi = Array.isArray(source.imageGallery) ? source.imageGallery : []

  formData.value = {
    name: source.name || product.name,
    description: source.description || product.description || '',
    price: source.price ?? product.price,
    stock: source.stock ?? product.stock,
    category: source.category || product.category || '',
    imageUrl,
    imageFile: null,
    imageGallery:
      galleryFromApi.length > 0
        ? galleryFromApi.slice()
        : Array.isArray(product.imageGallery) && product.imageGallery.length
          ? product.imageGallery.slice()
          : imageUrl
            ? [imageUrl]
            : [],
    isActive: typeof source.isActive === 'boolean' ? source.isActive : product.isActive,
    bundleOptions: Array.isArray(source.bundleOptions) ? source.bundleOptions.map((b: any) => ({
      id: b.id || `bundle-${Date.now()}-${Math.random()}`,
      label: b.label || '',
      badge: b.badge || '',
      multiplier: b.multiplier || 1,
      priceDelta: b.priceDelta || 0,
    })) : [],
    deliveryOffers: Array.isArray(source.deliveryOffers) ? source.deliveryOffers.map((d: any) => ({
      icon: d.icon || '',
      text: d.text || '',
    })) : [],
    tags: Array.isArray(source.tags) ? source.tags.map((t: any) => ({
      icon: t.icon || '',
      text: t.text || '',
      color: t.color || '',
    })) : [],
  }
  showAddDialog.value = true
}

const openAddDialog = () => {
  if (previewObjectUrl.value) {
    URL.revokeObjectURL(previewObjectUrl.value)
    previewObjectUrl.value = null
  }
  editingProduct.value = null
  previewError.value = false
  formData.value = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    imageUrl: '',
    imageFile: null,
    imageGallery: [],
    isActive: true,
    bundleOptions: [],
    deliveryOffers: [],
    tags: [],
  }
  fileInputKey.value += 1
  showAddDialog.value = true
}

const confirmDelete = (product: any) => {
  deletingProduct.value = product
  showDeleteDialog.value = true
}

const uploadStore = useUploadStore()

const onProductImageSelect = async (files: File[] | File | null) => {
  const list = Array.isArray(files) ? files : files ? [files] : []
  if (!list.length) {
    previewObjectUrl.value = null
    return
  }

  const validFiles = list.filter((file) => file.type.startsWith('image/'))
  if (!validFiles.length) {
    toast.error('Please select image files')
    return
  }

  const fd = new FormData()
  validFiles.forEach((file) => fd.append('files', file))

  const firstFile = validFiles[0]
  if (previewObjectUrl.value) URL.revokeObjectURL(previewObjectUrl.value)
  previewObjectUrl.value = URL.createObjectURL(firstFile)
  previewError.value = false

  try {
    uploading.value = true
    const uploaded = await uploadStore.uploadFile(fd)
    const urls = Array.isArray(uploaded)
      ? uploaded
          .map((item: any) =>
            typeof item?.url === 'string' ? item.url : null
          )
          .filter((u: string | null): u is string => Boolean(u))
      : []

    if (!urls.length) {
      toast.error('Image upload failed')
    } else {
      if (!Array.isArray(formData.value.imageGallery)) {
        formData.value.imageGallery = []
      }
      formData.value.imageGallery = [
        ...formData.value.imageGallery,
        ...urls,
      ]
      if (!formData.value.imageUrl && urls[0]) {
        formData.value.imageUrl = urls[0]
      }
      previewError.value = false
    }
  } catch {
    toast.error('Image upload failed')
  } finally {
    uploading.value = false
    formData.value.imageFile = null
    fileInputKey.value += 1
  }
}

const handleSave = async () => {
  const name = formData.value.name?.trim()
  if (!name) {
    toast.error('Name is required')
    return
  }
  try {
    saving.value = true
    const price = Number(formData.value.price)
    const stock = Number(formData.value.stock)
    const payload = {
      name,
      description: formData.value.description?.trim() || undefined,
      price: Number.isFinite(price) ? price : 0,
      stock: Number.isFinite(stock) ? stock : 0,
      category: formData.value.category?.trim() || undefined,
      imageUrl: formData.value.imageUrl?.trim() || undefined,
      imageGallery:
        Array.isArray(formData.value.imageGallery) &&
        formData.value.imageGallery.length
          ? formData.value.imageGallery
          : undefined,
      isActive: formData.value.isActive,
      bundleOptions: formData.value.bundleOptions
        .filter(b => b.label?.trim())
        .map(b => ({
          id: b.id || `bundle-${Date.now()}-${Math.random()}`,
          label: b.label.trim(),
          badge: b.badge?.trim() || undefined,
          multiplier: Number(b.multiplier) || 1,
          priceDelta: Number(b.priceDelta) || 0,
        })),
      deliveryOffers: formData.value.deliveryOffers
        .filter(o => o.text?.trim())
        .map(o => ({
          icon: o.icon?.trim() || '',
          text: o.text.trim(),
        })),
      tags: formData.value.tags
        .filter(t => t.text?.trim())
        .map(t => ({
          icon: t.icon?.trim() || '',
          text: t.text.trim(),
          color: t.color?.trim() || undefined,
        })),
    }
    if (editingProduct.value) {
      await productStore.updateProduct(editingProduct.value.id, payload)
      toast.success('Product updated')
    } else {
      await productStore.addProduct(payload)
      toast.success('Product added')
    }
    showAddDialog.value = false
    editingProduct.value = null
    if (previewObjectUrl.value) {
      URL.revokeObjectURL(previewObjectUrl.value)
      previewObjectUrl.value = null
    }
    formData.value = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      imageUrl: '',
      imageFile: null,
      imageGallery: [],
      isActive: true,
      bundleOptions: [],
      deliveryOffers: [],
      tags: [],
    }
    const pageNum = route.query.page != null && Number(route.query.page) >= 1 ? Number(route.query.page) : 1
    const searchStr = (route.query.search as string) ?? ''
    await getProducts(searchStr, pageNum)
  } catch {
    toast.error(editingProduct.value ? 'Failed to update product' : 'Failed to add product')
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  try {
    deleting.value = true
    await productStore.deleteProduct(deletingProduct.value.id)
    toast.success('Product deleted')
    showDeleteDialog.value = false
    const pageNum = route.query.page != null && Number(route.query.page) >= 1 ? Number(route.query.page) : 1
    const searchStr = (route.query.search as string) ?? ''
    await getProducts(searchStr, pageNum)
  } finally {
    deleting.value = false
  }
}

watchEffect(async () => {
  const page = route.query.page != null && Number(route.query.page) >= 1 ? Number(route.query.page) : 1
  const search = (route.query.search as LocationQueryValue) ?? ''
  await getProducts(search, page)
})
</script>

<style scoped>
.product-form-card {
  border-radius: 12px;
}
.product-image-preview {
  width: 82px;
  height: 82px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #dde7ee;
}
.product-image-primary {
  width: 100%;
  max-width: 360px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #dde7ee;
}
.product-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.product-gallery-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.product-gallery-remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  background: white;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.04);
}
.product-gallery-primary-chip {
  font-size: 11px;
}
</style>
