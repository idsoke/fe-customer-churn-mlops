import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import type { CustomerData, ModelInfo, PredictionResponse } from './churn.models';

@Service()
export class Churn {
  private readonly http = inject(HttpClient);

  predict(data: CustomerData) {
    return this.http.post<PredictionResponse>(`${environment.apiBaseUrl}/predict`, data);
  }

  getModelInfo() {
    return this.http.get<ModelInfo>(`${environment.apiBaseUrl}/model/info`);
  }
}
