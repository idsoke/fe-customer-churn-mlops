import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Churn } from '../../core/churn';
import type { CustomerData, ModelInfo, PredictionResponse } from '../../core/churn.models';

type RiskTone = 'green' | 'amber' | 'red';

interface Indicator {
  label: string;
  tag: string;
  cls: 'risk' | 'protective' | 'neutral';
  weight: number;
}

const DEFAULTS = {
  Tenure: 12,
  PreferredLoginDevice: 'Mobile Phone',
  CityTier: 1,
  WarehouseToHome: 15,
  PreferredPaymentMode: 'Credit Card',
  Gender: 'Male',
  HourSpendOnApp: 3,
  NumberOfDeviceRegistered: 4,
  PreferedOrderCat: 'Laptop & Accessory',
  SatisfactionScore: 3,
  MaritalStatus: 'Single',
  NumberOfAddress: 2,
  Complain: 0,
  OrderAmountHikeFromlastYear: 15,
  CouponUsed: 1,
  OrderCount: 2,
  DaySinceLastOrder: 5,
  CashbackAmount: 150,
} as const;

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-predictor',
  styleUrl: './predictor.css',
  templateUrl: './predictor.html',
})
export class Predictor {
  private readonly fb = inject(FormBuilder);
  private readonly churn = inject(Churn);

  readonly loginDevices = ['Mobile Phone', 'Phone', 'Computer'];
  readonly paymentModes = ['Credit Card', 'Debit Card', 'E wallet', 'Cash on Delivery', 'UPI'];
  readonly genders = ['Male', 'Female'];
  readonly orderCats = ['Mobile Phone', 'Fashion', 'Grocery', 'Laptop & Accessory', 'Others'];
  readonly maritalStatuses = ['Single', 'Married', 'Divorced'];

  readonly form = this.fb.nonNullable.group({
    Tenure: [DEFAULTS.Tenure, [Validators.required, Validators.min(0)]],
    PreferredLoginDevice: [DEFAULTS.PreferredLoginDevice, Validators.required],
    CityTier: [DEFAULTS.CityTier, Validators.required],
    WarehouseToHome: [DEFAULTS.WarehouseToHome, [Validators.required, Validators.min(0)]],
    PreferredPaymentMode: [DEFAULTS.PreferredPaymentMode, Validators.required],
    Gender: [DEFAULTS.Gender, Validators.required],
    HourSpendOnApp: [DEFAULTS.HourSpendOnApp, [Validators.required, Validators.min(0)]],
    NumberOfDeviceRegistered: [DEFAULTS.NumberOfDeviceRegistered, [Validators.required, Validators.min(0)]],
    PreferedOrderCat: [DEFAULTS.PreferedOrderCat, Validators.required],
    SatisfactionScore: [DEFAULTS.SatisfactionScore, [Validators.required, Validators.min(1), Validators.max(5)]],
    MaritalStatus: [DEFAULTS.MaritalStatus, Validators.required],
    NumberOfAddress: [DEFAULTS.NumberOfAddress, [Validators.required, Validators.min(0)]],
    Complain: [DEFAULTS.Complain as number, Validators.required],
    OrderAmountHikeFromlastYear: [DEFAULTS.OrderAmountHikeFromlastYear, [Validators.required, Validators.min(0)]],
    CouponUsed: [DEFAULTS.CouponUsed, [Validators.required, Validators.min(0)]],
    OrderCount: [DEFAULTS.OrderCount, [Validators.required, Validators.min(0)]],
    DaySinceLastOrder: [DEFAULTS.DaySinceLastOrder, [Validators.required, Validators.min(0)]],
    CashbackAmount: [DEFAULTS.CashbackAmount, [Validators.required, Validators.min(0)]],
  });

  readonly loading = signal(false);
  readonly apiOnline = signal<boolean | null>(null);
  readonly errorMessage = signal('');
  readonly result = signal<PredictionResponse | null>(null);
  readonly modelInfo = signal<ModelInfo | null>(null);
  readonly showToast = signal(false);

  readonly percentage = computed(() => Math.round((this.result()?.churn_probability ?? 0) * 100));

  readonly tone = computed<RiskTone>(() => {
    const p = this.result()?.churn_probability ?? 0;
    if (p > 0.65) return 'red';
    if (p > 0.35) return 'amber';
    return 'green';
  });

  readonly riskLabel = computed(() => {
    if (!this.result()) return '–';
    const tone = this.tone();
    return tone === 'red' ? 'Risiko Tinggi' : tone === 'amber' ? 'Risiko Sedang' : 'Risiko Rendah';
  });

  readonly gaugeDeg = computed(() => `${Math.round(this.percentage() * 3.6)}deg`);

  readonly indicators = computed<Indicator[]>(() => {
    if (!this.result()) return [];
    const v = this.form.getRawValue();
    const items: Indicator[] = [];

    items.push(
      v.Complain === 1
        ? { label: 'Riwayat Komplain', tag: 'Meningkatkan risiko', cls: 'risk', weight: 80 }
        : { label: 'Riwayat Komplain', tag: 'Menurunkan risiko', cls: 'protective', weight: 40 },
    );

    items.push(
      v.Tenure < 6
        ? { label: 'Lama Berlangganan', tag: 'Meningkatkan risiko', cls: 'risk', weight: Math.min(90, 40 + (6 - v.Tenure) * 6) }
        : { label: 'Lama Berlangganan', tag: 'Menurunkan risiko', cls: 'protective', weight: Math.min(90, 30 + v.Tenure) },
    );

    if (v.SatisfactionScore <= 2) {
      items.push({ label: 'Skor Kepuasan', tag: 'Meningkatkan risiko', cls: 'risk', weight: 75 });
    } else if (v.SatisfactionScore >= 4) {
      items.push({ label: 'Skor Kepuasan', tag: 'Menurunkan risiko', cls: 'protective', weight: 70 });
    } else {
      items.push({ label: 'Skor Kepuasan', tag: 'Pengaruh kecil', cls: 'neutral', weight: 25 });
    }

    items.push(
      v.DaySinceLastOrder > 10
        ? { label: 'Hari Sejak Pesanan Terakhir', tag: 'Meningkatkan risiko', cls: 'risk', weight: Math.min(90, 40 + v.DaySinceLastOrder) }
        : { label: 'Hari Sejak Pesanan Terakhir', tag: 'Pengaruh kecil', cls: 'neutral', weight: 25 },
    );

    items.push(
      v.HourSpendOnApp < 2
        ? { label: 'Waktu di Aplikasi', tag: 'Meningkatkan risiko', cls: 'risk', weight: 55 }
        : { label: 'Waktu di Aplikasi', tag: 'Menurunkan risiko', cls: 'protective', weight: 50 },
    );

    return items.sort((a, b) => b.weight - a.weight);
  });

  readonly insight = computed(() => {
    const r = this.result();
    if (!r) return '';
    const v = this.form.getRawValue();

    if (r.churn_probability > 0.65) {
      const step =
        v.Complain === 1
          ? 'Hubungi pelanggan untuk menindaklanjuti komplain sebelumnya'
          : 'Tawarkan kupon atau cashback khusus sebagai insentif';
      return `<strong>Risiko tinggi.</strong> ${step} sebelum pelanggan berhenti berlangganan.`;
    }
    if (r.churn_probability > 0.35) {
      return `<strong>Risiko sedang.</strong> Pantau aktivitas pelanggan ini. Reminder pesanan atau program loyalitas bisa membantu.`;
    }
    return `<strong>Risiko rendah.</strong> Tidak perlu tindakan khusus untuk pelanggan ini saat ini.`;
  });

  constructor() {
    this.churn.getModelInfo().subscribe({
      next: (info) => {
        this.modelInfo.set(info);
        this.apiOnline.set(true);
      },
      error: () => this.apiOnline.set(false),
    });
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.churn.predict(this.form.getRawValue() as CustomerData).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
        this.apiOnline.set(true);
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 1800);
      },
      error: (err) => {
        this.loading.set(false);
        this.apiOnline.set(false);
        this.errorMessage.set(
          err.status === 0
            ? 'Tidak bisa terhubung ke API. Pastikan FastAPI berjalan di http://localhost:8000.'
            : (err.error?.detail ?? 'Terjadi kesalahan saat memproses prediksi.'),
        );
      },
    });
  }

  onReset(): void {
    this.form.reset(DEFAULTS);
    this.result.set(null);
    this.errorMessage.set('');
  }
}
