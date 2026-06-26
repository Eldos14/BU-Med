<?php

use App\Http\Controllers\Admin\AppointmentController as AdminAppointmentController;
use App\Http\Controllers\PublicDoctorController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DoctorController as AdminDoctorController;
use App\Http\Controllers\Admin\PatientController as AdminPatientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Doctor\AppointmentController as DoctorAppointmentController;
use App\Http\Controllers\Doctor\DashboardController as DoctorDashboardController;
use App\Http\Controllers\Doctor\PatientController as DoctorPatientController;
use App\Http\Controllers\Doctor\ProfileController as DoctorProfileController;
use App\Http\Controllers\Doctor\ScheduleController as DoctorScheduleController;
use App\Http\Controllers\Patient\AiAssistantController;
use App\Http\Controllers\Patient\AppointmentController;
use App\Http\Controllers\Patient\ClinicController;
use App\Http\Controllers\Patient\DoctorController;
use App\Http\Controllers\Patient\HistoryController;
use App\Http\Controllers\Patient\NotificationController;
use App\Http\Controllers\Patient\OsmsController;
use App\Http\Controllers\Patient\PatientDashboardController;
use App\Http\Controllers\Patient\PatientEmailController;
use App\Http\Controllers\Patient\PatientProfileController;
use App\Http\Controllers\Patient\QuestionController;
use App\Http\Controllers\Patient\ReviewController as PatientReviewController;
use App\Http\Controllers\Admin\QuestionController as AdminQuestionController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $specialtyNames = ['Терапевт', 'Кардиолог', 'Педиатр', 'Невролог', 'Хирург', 'Офтальмолог', 'Дерматолог', 'Гинеколог'];

    $specialtyCounts = collect($specialtyNames)->mapWithKeys(function ($name) {
        $count = \App\Models\Staff::where(function ($q) use ($name) {
            $q->where('position', 'like', "%{$name}%")
                ->orWhereHas('specializations', fn ($s) => $s->where('specialty', 'like', "%{$name}%"));
        })->count();

        return [$name => $count];
    });

    $featuredReviews = \App\Models\Review::with(['patient', 'branch'])
        ->where('show_on_main', true)
        ->latest()
        ->get();

    $doctors = \App\Models\Staff::with(['specializations', 'workPlaces.branch'])
        ->withCount('doctorReviews')
        ->withAvg('doctorReviews', 'rating')
        ->latest()
        ->take(8)
        ->get()
        ->map(fn ($s) => [
            'id' => $s->id,
            'fio' => $s->fio,
            'position' => $s->position,
            'specializations' => $s->specializations->pluck('specialty')->all(),
            'room' => $s->workPlaces->first()?->room,
            'branch' => $s->workPlaces->first()?->branch?->name,
            'initial' => mb_strtoupper(mb_substr($s->fio, 0, 1)),
            'photo' => $s->photo ? asset('storage/'.$s->photo) : null,
            'rating_avg' => $s->doctor_reviews_count > 0 ? round((float) $s->doctor_reviews_avg_rating, 1) : null,
            'rating_count' => $s->doctor_reviews_count,
        ]);

    return Inertia::render('welcome', [
        'stats' => [
            'doctors' => \App\Models\Staff::count(),
            'patients' => \App\Models\Patient::count(),
            'appointments' => \App\Models\Appointment::count(),
        ],
        'specialty_counts' => $specialtyCounts,
        'featured_reviews' => $featuredReviews,
        'doctors' => $doctors,
    ]);
})->name('home');

Route::get('/doctors', [PublicDoctorController::class, 'index'])->name('doctors.index');
Route::get('/doctors/{staff}', [PublicDoctorController::class, 'show'])->name('doctors.show');
Route::post('/doctors/{staff}/reviews', [PublicDoctorController::class, 'storeReview'])
    ->middleware(['auth', 'role:patient'])->name('doctors.reviews.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::post('_notifications/{notification}/read', [\App\Http\Controllers\Patient\NotificationController::class, 'markRead'])->name('notifications.mark');
    Route::post('_notifications/read-all', [\App\Http\Controllers\Patient\NotificationController::class, 'markAllRead'])->name('notifications.mark-all');
});

Route::middleware(['auth', 'role:patient'])->prefix('patient')->name('patient.')->group(function () {
    Route::get('dashboard', [PatientDashboardController::class, 'index'])->name('dashboard');

    Route::post('ai-assistant', [AiAssistantController::class, 'ask'])->name('ai.ask');

    Route::get('profile/edit', [PatientProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [PatientProfileController::class, 'update'])->name('profile.update');

    Route::post('email/request-change', [PatientEmailController::class, 'requestChange'])->name('email.request-change');
    Route::post('email/confirm-change', [PatientEmailController::class, 'confirmChange'])->name('email.confirm-change');

    Route::get('appointment', [DoctorController::class, 'myDoctor'])->name('appointment');
    Route::get('doctors', [DoctorController::class, 'index'])->name('doctors.index');
    Route::get('doctors/{staff}', [DoctorController::class, 'show'])->name('doctors.show');

    Route::post('appointments', [AppointmentController::class, 'store'])->name('appointments.store');
    Route::patch('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel'])->name('appointments.cancel');

    Route::get('history', [HistoryController::class, 'index'])->name('history');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');

    Route::get('clinic', [ClinicController::class, 'index'])->name('clinic');
    Route::post('clinic/reviews', [PatientReviewController::class, 'store'])->name('reviews.store');
    Route::post('clinic/questions', [QuestionController::class, 'store'])->name('questions.store');

    Route::get('osms', [OsmsController::class, 'index'])->name('osms');
});

Route::middleware(['auth', 'role:doctor'])->prefix('doctor')->name('doctor.')->group(function () {
    Route::get('dashboard', [DoctorDashboardController::class, 'index'])->name('dashboard');

    Route::get('patients', [DoctorPatientController::class, 'index'])->name('patients.index');
    Route::get('patients/{patientId}/history', [DoctorPatientController::class, 'history'])->name('patients.history');

    Route::get('appointments/create', [DoctorAppointmentController::class, 'create'])->name('appointments.create');
    Route::get('patients/search', [DoctorAppointmentController::class, 'searchPatients'])->name('patients.search');
    Route::get('patients/{patientId}/brief-history', [DoctorAppointmentController::class, 'patientHistory'])->name('patients.brief-history');
    Route::post('appointments', [DoctorAppointmentController::class, 'store'])->name('appointments.store');
    Route::patch('appointments/{appointment}/accept', [DoctorAppointmentController::class, 'accept'])->name('appointments.accept');
    Route::patch('appointments/{appointment}/cancel', [DoctorAppointmentController::class, 'cancel'])->name('appointments.cancel');

    Route::get('profile', [DoctorProfileController::class, 'edit'])->name('profile.edit');
    Route::match(['PATCH', 'POST'], 'profile', [DoctorProfileController::class, 'update'])->name('profile.update');

    Route::get('schedule', [DoctorScheduleController::class, 'index'])->name('schedule');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::get('doctors', [AdminDoctorController::class, 'index'])->name('doctors.index');
    Route::get('doctors/create', [AdminDoctorController::class, 'create'])->name('doctors.create');
    Route::post('doctors', [AdminDoctorController::class, 'store'])->name('doctors.store');
    Route::get('doctors/{doctor}/edit', [AdminDoctorController::class, 'edit'])->name('doctors.edit');
    Route::patch('doctors/{doctor}', [AdminDoctorController::class, 'update'])->name('doctors.update');
    Route::delete('doctors/{doctor}', [AdminDoctorController::class, 'destroy'])->name('doctors.destroy');

    Route::get('patients', [AdminPatientController::class, 'index'])->name('patients.index');
    Route::get('patients/{patient}', [AdminPatientController::class, 'show'])->name('patients.show');
    Route::patch('patients/{patient}/assign-doctor', [AdminPatientController::class, 'assignDoctor'])->name('patients.assign-doctor');
    Route::delete('patients/{patient}', [AdminPatientController::class, 'destroy'])->name('patients.destroy');

    Route::get('appointments', [AdminAppointmentController::class, 'index'])->name('appointments.index');
    Route::patch('appointments/{appointment}', [AdminAppointmentController::class, 'update'])->name('appointments.update');

    Route::get('reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
    Route::patch('reviews/{review}/toggle-main', [AdminReviewController::class, 'toggleMain'])->name('reviews.toggle-main');

    Route::get('questions', [AdminQuestionController::class, 'index'])->name('questions.index');
    Route::patch('questions/{question}/toggle-answered', [AdminQuestionController::class, 'markAnswered'])->name('questions.toggle-answered');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
