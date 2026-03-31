import {
  format,
  createLogger,
  transports,
  Logger as WinstonLogger,
} from 'winston';
import LokiTransport from 'winston-loki';
import { ClsContextService } from '../utils/cls-context.service';

export class Logger {
  private static instance: WinstonLogger;

  static initialize() {
    const transportList: WinstonLogger['transports'] = [
      new transports.Console({
        format: format.combine(
          format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
          format.colorize(),
          format.printf((info) => {
            const requestId = ClsContextService.getRequestId();
            const requestIdStr = requestId ? ` [${requestId}]` : '';
            return `[${info.level}]${requestIdStr} : ${info.message} : ${[info.timestamp]}`;
          }),
        ),
      }),
    ];
    // Only add Loki when explicitly configured (avoids hang if Loki not running locally)
    if (process.env.GRAFANA_LOKI_URL) {
      transportList.push(
        new LokiTransport({
          host: process.env.GRAFANA_LOKI_URL,
          basicAuth: `${process.env.GRAFANA_LOKI_USER}:${process.env.GRAFANA_LOKI_TOKEN}`,
          labels: {
            app:
              process.env.NODE_ENV === 'production'
                ? 'smoll-api'
                : 'smoll-api-dev',
          },
          json: true,
          format: format.combine(
            format.timestamp(),
            format.json(),
            format.printf((info) => {
              const requestId = ClsContextService.getRequestId();
              return JSON.stringify({
                ...info,
                requestId: requestId || null,
              });
            }),
          ),
          replaceTimestamp: true,
          onConnectionError: (err) => console.error(err),
        }),
      );
    }
    Logger.instance = createLogger({
      transports: transportList,
    });

    return Logger.instance;
  }

  static getInstance() {
    return Logger.instance;
  }
}
