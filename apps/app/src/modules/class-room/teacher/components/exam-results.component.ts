import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType, ChartData } from 'chart.js';
import { ExamsManagementFacade } from '../facades/exams-management-facade.service';
import { ActivatedRoute, Router } from '@angular/router';

export interface ExamResult {
  id: string;
  userId: string;
  examId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  userInfo?: {
    name: string;
    email: string;
  };
  submittedAt?: Date;
}

@Component({
  selector: 'app-exam-results',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <!-- Header -->
      <div class="flex items-center space-x-3 mb-6">
        <button (click)="goBack()" class="inline-flex items-center px-3 py-2 rounded-xl bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <div>
          <div class="text-sm text-gray-500">Exam Results</div>
          <div class="text-xl font-semibold text-gray-900">{{ examName() || 'Loading...' }}</div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>

      <!-- Results Content -->
      <div *ngIf="!isLoading() && examResults().length > 0">
        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-blue-600">Total Submissions</p>
                <p class="text-2xl font-bold text-blue-900">{{ examResults().length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-green-50 rounded-lg p-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-green-600">Average Score</p>
                <p class="text-2xl font-bold text-green-900">{{ averageScore() }}%</p>
              </div>
            </div>
          </div>

          <div class="bg-yellow-50 rounded-lg p-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-yellow-600">Highest Score</p>
                <p class="text-2xl font-bold text-yellow-900">{{ highestScore() }}%</p>
              </div>
            </div>
          </div>

          <div class="bg-red-50 rounded-lg p-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-red-600">Lowest Score</p>
                <p class="text-2xl font-bold text-red-900">{{ lowestScore() }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart -->
        <div class="mb-8">
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
            <div class="h-80">
              <canvas
                baseChart
                [data]="chartData()"
                [options]="chartOptions"
                [type]="$any(chartType)">
              </canvas>
            </div>
          </div>
        </div>

        <!-- Results Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th class="px-6 py-3">Student</th>
                <th class="px-6 py-3">Score</th>
                <th class="px-6 py-3">Percentage</th>
                <th class="px-6 py-3">Status</th>
                <th class="px-6 py-3">Delete</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let result of sortedResults(); trackBy: trackByUserId"
                  class="bg-white border-b hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span class="text-xs font-medium text-purple-600">
                        {{ getUserInitials(result.userId) }}
                      </span>
                    </div>
                    <div>
                      <p class="font-medium">{{ result.userInfo?.name || result.userId }}</p>
                      <p class="text-xs text-gray-500">{{ result.userInfo?.email || '' }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="font-medium">{{ result.correctAnswers }}/{{ result.totalQuestions }}</span>
                  <div class="text-xs text-gray-500">{{ result.score }} points</div>
                </td>
                <td class="px-6 py-4">
                  <span [class]="getPercentageClass(result.percentage)">
                    {{ result.percentage }}%
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span [class]="getStatusBadgeClass(result.percentage)">
                    {{ getStatusText(result.percentage) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <button (click)="deleteResult(result)"
                          class="text-gray-400 hover:text-red-600 transition-colors p-1 rounded"
                          aria-label="Delete result">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && examResults().length === 0" class="text-center py-12">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
        <p class="text-sm text-gray-600">No students have submitted this exam yet.</p>
      </div>
    </div>
  `
})
export class ExamResultsComponent implements OnInit {
  @Input() examId!: string;
  @Input() classroomId!: string;

  private examResultsSignal = signal<ExamResult[]>([]);
  private isLoadingSignal = signal<boolean>(true);
  private examNameSignal = signal<string>('');

  // Public readonly signals
  examResults = this.examResultsSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  examName = this.examNameSignal.asReadonly();

  // Computed values
  averageScore = computed(() => {
    const results = this.examResults();
    if (results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + result.percentage, 0);
    return Math.round(total / results.length);
  });

  highestScore = computed(() => {
    const results = this.examResults();
    if (results.length === 0) return 0;
    return Math.max(...results.map(r => r.percentage));
  });

  lowestScore = computed(() => {
    const results = this.examResults();
    if (results.length === 0) return 0;
    return Math.min(...results.map(r => r.percentage));
  });

  sortedResults = computed(() => {
    return [...this.examResults()].sort((a, b) => b.percentage - a.percentage);
  });

  chartData = computed((): ChartData<'bar'> => {
    const results = this.examResults();
    return {
      labels: results.map(r => r.userInfo?.name || r.userId),
      datasets: [
        {
          label: 'Score (%)',
          data: results.map(r => r.percentage),
          backgroundColor: 'rgba(147, 51, 234, 0.8)',
          borderColor: 'rgba(147, 51, 234, 1)',
          borderWidth: 1
        }
      ]
    };
  });

  // Chart configuration
  chartType: ChartType = 'bar';
  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Score: ${context.parsed.y}%`;
          }
        }
      }
    }
  };

  constructor(
    private examsManagement: ExamsManagementFacade,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Get params from route if not provided as inputs
    if (!this.examId) {
      this.examId = this.route.snapshot.params['examId'];
    }
    if (!this.classroomId) {
      this.classroomId = this.route.snapshot.params['classRoomId'];
    }

    this.loadExamResults();
    this.loadExamInfo();
  }

  async deleteResult(result: ExamResult): Promise<void> {
    if (!confirm(`Are you sure you want to delete this exam result for ${result.userInfo?.name || result.userId}?`)) {
      return;
    }

    try {
      const success = await this.examsManagement.deleteExamResult(result.id);
      if (success) {
        // Remove the result from the local state
        const currentResults = this.examResults();
        const updatedResults = currentResults.filter(r => r.id !== result.id);
        this.examResultsSignal.set(updatedResults);
      } else {
        alert('Failed to delete exam result. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting exam result:', error);
      alert('Failed to delete exam result. Please try again.');
    }
  }

  private async loadExamResults() {
    this.isLoadingSignal.set(true);
    try {
      const results = await this.examsManagement.getExamResults(this.examId, this.classroomId);
      this.examResultsSignal.set(results);
    } catch (error) {
      console.error('Failed to load exam results:', error);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  private async loadExamInfo() {
    try {
      const exam = await this.examsManagement.getExam(this.examId);
      if (exam) {
        this.examNameSignal.set(exam.name);
      }
    } catch (error) {
      console.error('Failed to load exam info:', error);
    }
  }

  getUserInitials(userId: string): string {
    return userId.substring(0, 2).toUpperCase();
  }

  getPercentageClass(percentage: number): string {
    if (percentage >= 90) return 'text-green-600 font-semibold';
    if (percentage >= 80) return 'text-blue-600 font-semibold';
    if (percentage >= 70) return 'text-yellow-600 font-semibold';
    if (percentage >= 60) return 'text-orange-600 font-semibold';
    return 'text-red-600 font-semibold';
  }

  getStatusBadgeClass(percentage: number): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    if (percentage >= 90) return `${baseClass} bg-green-100 text-green-800`;
    if (percentage >= 80) return `${baseClass} bg-blue-100 text-blue-800`;
    if (percentage >= 70) return `${baseClass} bg-yellow-100 text-yellow-800`;
    if (percentage >= 60) return `${baseClass} bg-orange-100 text-orange-800`;
    return `${baseClass} bg-red-100 text-red-800`;
  }

  getStatusText(percentage: number): string {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Satisfactory';
    if (percentage >= 60) return 'Needs Improvement';
    return 'Unsatisfactory';
  }

  trackByUserId(index: number, result: ExamResult): string {
    return result.userId;
  }

  goBack(): void {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }
}
