<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Patient;
use App\Models\Specialization;
use App\Models\Staff;
use App\Models\User;
use App\Models\WorkPlace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoPeopleSeeder extends Seeder
{
    /** @var array<int, string> */
    private array $kzMaleFirst = ['Айбек', 'Нурлан', 'Даулет', 'Ерлан', 'Азамат', 'Бауыржан', 'Талгат', 'Серик', 'Кайрат', 'Арман', 'Диас', 'Алихан', 'Нурсултан', 'Аблай', 'Галымжан'];

    /** @var array<int, string> */
    private array $kzFemaleFirst = ['Айгерим', 'Дана', 'Жанар', 'Айжан', 'Гульнара', 'Мадина', 'Айгуль', 'Салтанат', 'Асем', 'Динара', 'Аида', 'Зарина', 'Ботагоз', 'Айнур', 'Камила'];

    /** @var array<int, string> */
    private array $kzSurname = ['Ахметов', 'Нурланов', 'Даулетов', 'Серикбаев', 'Тулегенов', 'Жумабеков', 'Сулейменов', 'Искаков', 'Омаров', 'Абенов', 'Касымов', 'Сагатов', 'Бекжанов', 'Оспанов', 'Токтаров', 'Жаксыбеков', 'Калиев', 'Мухамеджанов'];

    /** @var array<int, string> */
    private array $ruMaleFirst = ['Иван', 'Дмитрий', 'Сергей', 'Алексей', 'Андрей', 'Николай', 'Михаил', 'Павел'];

    /** @var array<int, string> */
    private array $ruFemaleFirst = ['Елена', 'Ольга', 'Наталья', 'Татьяна', 'Ирина', 'Светлана', 'Анна', 'Мария'];

    /** @var array<int, string> */
    private array $ruSurname = ['Иванов', 'Петров', 'Смирнов', 'Волков', 'Соколов', 'Попов', 'Козлов', 'Новиков', 'Морозов', 'Лебедев'];

    /** @var array<int, string> */
    private array $specialties = ['Терапевт', 'Кардиолог', 'Педиатр', 'Невролог', 'Хирург', 'Офтальмолог', 'Дерматолог', 'Гинеколог', 'Эндокринолог', 'Уролог'];

    /** @var array<string, string> */
    private array $usedEmails = [];

    public function run(): void
    {
        $branch = Branch::first() ?? Branch::create([
            'name' => 'Баишев мед',
            'address' => 'г. Актобе',
            'phone' => '+7 (7132) 00-00-00',
        ]);

        // ── 10 врачей ──
        $doctors = [];
        for ($i = 0; $i < 10; $i++) {
            [$fio, $latinFirst, $latinLast, $gender] = $this->makePerson($i, 10);

            $user = User::create([
                'name' => $fio,
                'email' => $this->makeEmail($latinFirst, $latinLast),
                'password' => Hash::make('password'),
                'role' => 'doctor',
            ]);

            $staff = Staff::create([
                'user_id' => $user->id,
                'fio' => $fio,
                'position' => $this->specialties[$i % count($this->specialties)],
                'contacts' => $this->makePhone(),
            ]);

            Specialization::create([
                'staff_id' => $staff->id,
                'specialty' => $this->specialties[$i % count($this->specialties)],
            ]);

            WorkPlace::create([
                'staff_id' => $staff->id,
                'branch_id' => $branch->id,
                'room' => (string) (100 + $i),
            ]);

            $doctors[] = $staff;
        }

        // ── 15 пациентов ──
        for ($i = 0; $i < 15; $i++) {
            [$fio, $latinFirst, $latinLast, $gender] = $this->makePerson($i, 15);

            $user = User::create([
                'name' => $fio,
                'email' => $this->makeEmail($latinFirst, $latinLast),
                'password' => Hash::make('password'),
                'role' => 'patient',
            ]);

            Patient::create([
                'user_id' => $user->id,
                'fio' => $fio,
                'iin' => $this->makeIin(),
                'birth_date' => now()->subYears(rand(18, 60))->subDays(rand(0, 364))->toDateString(),
                'gender' => $gender,
                'address' => 'г. Актобе, мкр. '.rand(1, 12).', д. '.rand(1, 80),
                'contacts' => $this->makePhone(),
                'clinic_id' => $branch->id,
                'district_doctor_id' => $doctors[$i % count($doctors)]->id,
                'osms_status' => (bool) rand(0, 1),
                'profile_complete' => true,
            ]);
        }
    }

    /**
     * @return array{0: string, 1: string, 2: string, 3: string} [ФИО, latinFirst, latinLast, gender]
     */
    private function makePerson(int $index, int $total): array
    {
        // 80% казахские ФИО, остальные русские
        $isKazakh = $index < (int) ceil($total * 0.8);
        $isMale = (bool) rand(0, 1);
        $gender = $isMale ? 'male' : 'female';

        if ($isKazakh) {
            $first = $isMale ? $this->pick($this->kzMaleFirst) : $this->pick($this->kzFemaleFirst);
            $last = $this->pick($this->kzSurname);
        } else {
            $first = $isMale ? $this->pick($this->ruMaleFirst) : $this->pick($this->ruFemaleFirst);
            $last = $this->pick($this->ruSurname);
        }

        if (! $isMale) {
            $last .= 'а'; // женская форма фамилии
        }

        $fio = $last.' '.$first;

        return [$fio, $this->translit($first), $this->translit($last), $gender];
    }

    /** @param array<int, string> $arr */
    private function pick(array $arr): string
    {
        return $arr[array_rand($arr)];
    }

    private function makeEmail(string $first, string $last): string
    {
        $domains = ['@mail.ru', '@mail.kz', '@gmail.com'];
        $base = strtolower($first.'.'.$last);
        $email = $base.$domains[array_rand($domains)];

        $n = 1;
        while (isset($this->usedEmails[$email]) || User::where('email', $email)->exists()) {
            $email = $base.$n.$domains[array_rand($domains)];
            $n++;
        }

        $this->usedEmails[$email] = $email;

        return $email;
    }

    private function makePhone(): string
    {
        return '+77'.rand(10, 99).str_pad((string) rand(0, 9999999), 7, '0', STR_PAD_LEFT);
    }

    private function makeIin(): string
    {
        return str_pad((string) rand(0, 999999999999), 12, '0', STR_PAD_LEFT);
    }

    private function translit(string $text): string
    {
        $map = [
            'а' => 'a', 'ә' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'ғ' => 'g', 'д' => 'd',
            'е' => 'e', 'ё' => 'e', 'ж' => 'zh', 'з' => 'z', 'и' => 'i', 'й' => 'i', 'к' => 'k',
            'қ' => 'k', 'л' => 'l', 'м' => 'm', 'н' => 'n', 'ң' => 'ng', 'о' => 'o', 'ө' => 'o',
            'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't', 'у' => 'u', 'ұ' => 'u', 'ү' => 'u',
            'ф' => 'f', 'х' => 'kh', 'һ' => 'h', 'ц' => 'ts', 'ч' => 'ch', 'ш' => 'sh', 'щ' => 'sch',
            'ъ' => '', 'ы' => 'y', 'і' => 'i', 'ь' => '', 'э' => 'e', 'ю' => 'yu', 'я' => 'ya',
        ];

        $result = '';
        $chars = mb_str_split(mb_strtolower($text));
        foreach ($chars as $ch) {
            $result .= $map[$ch] ?? $ch;
        }

        return $result;
    }
}
