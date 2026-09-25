import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { CustomerData, ModelInfo, PredictionResponse } from './churn.models';

const API_BASE_URL = 'http://localhost:8000';

@Service()
export class Churn {
  private readonly http = inject(HttpClient);

  predict(data: CustomerData) {
    return this.http.post<PredictionResponse>(`${API_BASE_URL}/predict`, data);
  }

  getModelInfo() {
    return this.http.get<ModelInfo>(`${API_BASE_URL}/model/info`);
  }
}
