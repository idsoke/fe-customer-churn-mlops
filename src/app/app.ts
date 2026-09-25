import { Component } from '@angular/core';
import { Predictor } from './features/predictor/predictor';

@Component({
  imports: [Predictor],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
