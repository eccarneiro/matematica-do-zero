import { requireAdmin, loadAdminData } from '@/server/admin';
import { DailyColumns, HBars } from '@/components/admin/Charts';
import { FeedbackList } from '@/components/admin/FeedbackList';
import { LEVEL_NAMES } from '@/generators/types';

const pct = (v: number | null) => (v === null ? '–' : `${Math.round(v * 100)}%`);
const num = (v: number) => v.toLocaleString('pt-BR');
const fmtDay = (key: string | null) => (key ? key.split('-').reverse().slice(0, 2).join('/') : '—');

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-[0.8rem] font-semibold text-ink-3">{label}</p>
      <p className="mt-1 font-display text-[1.9rem] leading-none font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1.5 text-[0.75rem] text-ink-3">{hint}</p>}
    </div>
  );
}

function Panel({ title, sub, children, className = '' }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 ${className}`}>
      <h2 className="text-[1.2rem]">{title}</h2>
      {sub && <p className="mb-4 text-[0.85rem] text-ink-3">{sub}</p>}
      {!sub && <div className="mb-4" />}
      {children}
    </section>
  );
}

export default async function AdminPage() {
  const { email } = await requireAdmin();
  const data = await loadAdminData();
  if (!data) {
    return <p className="card p-6">Banco de dados não configurado (DATABASE_URL).</p>;
  }
  const { metrics: m, feedback } = data;
  const newFeedback = feedback.filter((f) => f.status === 'novo').length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-[clamp(1.8rem,3vw,2.4rem)]">Painel</h1>
          <p className="text-ink-2">Alunos que entraram com Google. Visitas anônimas ficam no Vercel Analytics.</p>
        </div>
        <p className="text-[0.85rem] text-ink-3">Logado como {email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
        <Kpi label="Cadastrados" value={num(m.totals.users)} hint={`+${m.totals.new7} em 7 dias`} />
        <Kpi label="Ativos hoje" value={num(m.totals.activeToday)} />
        <Kpi label="Ativos em 7 dias" value={num(m.totals.active7)} />
        <Kpi label="Ativos em 30 dias" value={num(m.totals.active30)} />
        <Kpi label="Questões resolvidas" value={num(m.totals.questions)} />
        <Kpi label="Acerto de primeira" value={pct(m.totals.accuracy)} />
        <Kpi label="Aulas concluídas" value={num(m.totals.lessonsDone)} />
        <Kpi label="Feedbacks novos" value={num(newFeedback)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Alunos ativos por dia" sub="Quem ganhou XP no dia, últimos 30 dias.">
          <DailyColumns data={m.activeByDay} label="Ativos por dia" />
        </Panel>
        <Panel title="Novos cadastros por dia" sub="Primeiro login com Google, últimos 30 dias.">
          <DailyColumns data={m.signupsByDay} label="Cadastros por dia" />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Panel title="Alunos por nível" sub="Pelo XP total de cada aluno.">
          <HBars total={m.totals.users} data={m.levels.map((l) => ({ key: String(l.level), label: <>Nível {l.level} · <span className="text-ink-2">{l.title}</span></>, value: l.users }))} />
        </Panel>
        <Panel title="Funil das aulas" sub="Quantos concluíram cada aula.">
          <HBars total={m.totals.users} data={m.funnel.map((f, i) => ({ key: f.id, label: `${i + 1}. ${f.title}`, value: f.users }))} />
        </Panel>
        <Panel title="Sequência de dias" sub="Dias seguidos estudando, hoje.">
          <HBars total={m.totals.users} data={m.streakBuckets.map((b) => ({ key: b.label, label: b.label, value: b.users }))} />
        </Panel>
      </div>

      <Panel title="Treino por tópico" sub="Questões feitas, acerto de primeira e em que nível do treino os alunos estão.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[0.9rem]">
            <thead className="text-[0.75rem] font-bold tracking-wide text-ink-3 uppercase">
              <tr className="border-b border-line">
                <th className="py-2 pr-3">Tópico</th>
                <th className="py-2 pr-3 text-right">Alunos</th>
                <th className="py-2 pr-3 text-right">Questões</th>
                <th className="py-2 pr-3 text-right">Acerto</th>
                {[1, 2, 3].map((l) => <th key={l} className="py-2 pr-3 text-right">{LEVEL_NAMES[l as 1 | 2 | 3]}</th>)}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {m.topics.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0">
                  <td className="py-2.5 pr-3 font-semibold">{t.title}</td>
                  <td className="py-2.5 pr-3 text-right">{num(t.students)}</td>
                  <td className="py-2.5 pr-3 text-right">{num(t.questions)}</td>
                  <td className="py-2.5 pr-3 text-right">{pct(t.accuracy)}</td>
                  {t.byLevel.map((n, i) => <td key={i} className="py-2.5 pr-3 text-right text-ink-2">{num(n)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Panel title="Feedback" sub="O que os alunos estão dizendo.">
          <FeedbackList items={feedback} />
        </Panel>
        <Panel title="Alunos" sub={`${num(m.students.length)} cadastrados, mais recentes primeiro.`}>
          <div className="max-h-[640px] overflow-auto">
            <table className="w-full min-w-[620px] text-left text-[0.88rem]">
              <thead className="sticky top-0 bg-surface text-[0.75rem] font-bold tracking-wide text-ink-3 uppercase">
                <tr className="border-b border-line">
                  <th className="py-2 pr-3">Aluno</th>
                  <th className="py-2 pr-3">Nível</th>
                  <th className="py-2 pr-3 text-right">XP</th>
                  <th className="py-2 pr-3 text-right">Aulas</th>
                  <th className="py-2 pr-3 text-right">Sequência</th>
                  <th className="py-2 pr-3 text-right">Último estudo</th>
                  <th className="py-2 text-right">Cadastro</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {m.students.slice(0, 300).map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="py-2 pr-3">
                      <p className="font-semibold">{s.name ?? '—'}</p>
                      <p className="text-[0.78rem] text-ink-3">{s.email}</p>
                    </td>
                    <td className="py-2 pr-3">{s.level} · <span className="text-ink-2">{s.title}</span></td>
                    <td className="py-2 pr-3 text-right">{num(s.xp)}</td>
                    <td className="py-2 pr-3 text-right">{s.lessonsDone}</td>
                    <td className="py-2 pr-3 text-right">{s.streak ? `🔥 ${s.streak}` : '—'}</td>
                    <td className="py-2 pr-3 text-right">{fmtDay(s.lastActive)}</td>
                    <td className="py-2 text-right text-ink-3">{s.createdAt.toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
                {m.students.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-ink-3">Nenhum aluno entrou com Google ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
