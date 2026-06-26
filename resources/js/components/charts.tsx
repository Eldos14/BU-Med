interface Slice {
    label: string;
    value: number;
    color: string;
}

/** Пончиковая диаграмма (SVG) с центральным итогом. */
export function DonutChart({ data, size = 160, thickness = 22 }: { data: Slice[]; size?: number; thickness?: number }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    let offset = 0;

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={thickness} className="stroke-slate-100 dark:stroke-slate-800" />
                    {total > 0 &&
                        data.map((d, i) => {
                            const len = (d.value / total) * circumference;
                            const seg = (
                                <circle
                                    key={i}
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    fill="none"
                                    stroke={d.color}
                                    strokeWidth={thickness}
                                    strokeDasharray={`${len} ${circumference - len}`}
                                    strokeDashoffset={-offset}
                                    strokeLinecap="butt"
                                />
                            );
                            offset += len;
                            return seg;
                        })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-foreground">{total}</span>
                    <span className="text-[11px] text-muted-foreground">всего</span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {data.map((d) => (
                    <div key={d.label} className="flex items-center gap-2 text-sm">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-muted-foreground">{d.label}</span>
                        <span className="ml-auto font-semibold text-foreground">{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface Bar {
    label: string;
    value: number;
    date?: string;
}

/** Вертикальная столбчатая диаграмма (CSS). */
export function BarChart({ data, color = '#3b82f6', height = 180 }: { data: Bar[]; color?: string; height?: number }) {
    const max = Math.max(1, ...data.map((d) => d.value));

    return (
        <div className="flex items-end justify-between gap-2" style={{ height }}>
            {data.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end justify-center">
                        <div className="relative flex w-full max-w-[44px] justify-center">
                            <div
                                className="w-full rounded-t-lg transition-all duration-500"
                                style={{
                                    height: `${(d.value / max) * (height - 40)}px`,
                                    minHeight: d.value > 0 ? 4 : 0,
                                    backgroundColor: color,
                                }}
                            />
                            {d.value > 0 && (
                                <span className="absolute -top-5 text-xs font-semibold text-foreground">{d.value}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-medium capitalize text-muted-foreground">{d.label}</span>
                        {d.date && <span className="text-[10px] text-muted-foreground/60">{d.date}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Горизонтальный список-бары (как «Topic you are interested in»). */
export function HBarList({ data }: { data: Slice[] }) {
    const max = Math.max(1, ...data.map((d) => d.value));

    if (data.length === 0) {
        return <p className="py-8 text-center text-sm text-muted-foreground">Нет данных</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            {data.map((d) => (
                <div key={d.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{d.label}</span>
                        <span className="text-muted-foreground">{d.value}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
