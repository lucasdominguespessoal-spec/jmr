import React, { useState, useEffect } from "react";

// Estrutura de dados avançada para múltiplas séries por exercício
interface SerieData {
  carga: string;
  reps: string;
}

interface ExerciseData {
  series: SerieData[];
  obs: string;
}

interface LogEntry {
  id: number;
  date: string;
  treino: string;
  exercises: Record<string, ExerciseData>;
}

interface ProtocolExercise {
  name: string;
  seriesTarget: number; // Número exato de linhas de séries que serão geradas
  repsTarget: string;
  note: string;
  isTimeBased?: boolean; // Define se o rótulo muda para segundos
}

const PROTOCOLO_TREINOS: Record<string, ProtocolExercise[]> = {
  "UPPER 1": [
    { name: "Puxada Pronada", seriesTarget: 2, repsTarget: "8", note: "CLUSTER SETS" },
    { name: "Supino Inclinado c/ Halteres", seriesTarget: 2, repsTarget: "5-9", note: "Meta: 5 a 9 reps" },
    { name: "Desenvolvimento c/ Halteres", seriesTarget: 2, repsTarget: "5-9", note: "Meta: 5 a 9 reps" },
    { name: "Remada Barra T (pegada aberta)", seriesTarget: 2, repsTarget: "8", note: "CLUSTER SETS - Divida em 2 blocos" },
    { name: "Crucifixo Articulado", seriesTarget: 2, repsTarget: "8-12", note: "Meta: 8 a 12 reps" },
    { name: "Elevação Lateral c/ Halteres", seriesTarget: 2, repsTarget: "8-12", note: "Meta: 8 a 12 reps" },
    { name: "Rosca Alternada 45°", seriesTarget: 2, repsTarget: "8-12", note: "Meta: 8 a 12 reps" },
    { name: "Tríceps Francês na Polia (corda)", seriesTarget: 2, repsTarget: "8-12", note: "Meta: 8 a 12 reps" },
    { name: "Abdominal na Polia", seriesTarget: 2, repsTarget: "8-12", note: "Meta: 8 a 12 reps" }
  ],
  "LOWER 1": [
    { name: "Cadeira Abdutora", seriesTarget: 2, repsTarget: "8-12", note: "Meta: 8 a 12 reps" },
    { name: "Agachamento Búlgaro no Smith", seriesTarget: 2, repsTarget: "5-9", note: "Meta: 5 a 9 reps - Amplitude máxima" },
    { name: "Agachamento no Smith (Max Amplitude)", seriesTarget: 2, repsTarget: "5-9", note: "Faça o mais profundo possível" },
    { name: "Extensão de Panturrilha no Smith", seriesTarget: 2, repsTarget: "8-12", note: "Coloque uma anilha sob a ponta dos pés" },
    { name: "Mesa Flexora", seriesTarget: 2, repsTarget: "5-9", note: "Movimento controlado e máxima amplitude" },
    { name: "Cadeira Flexora", seriesTarget: 2, repsTarget: "8-12", note: "Meta: 8 a 12 reps" },
    { name: "Leg Press", seriesTarget: 2, repsTarget: "5-9", note: "Movimento controlado, vai pra morte" },
    { name: "Prancha Frontal", seriesTarget: 3, repsTarget: "60s", note: "Executar por 1 minuto", isTimeBased: true }
  ],
  "UPPER 2": [
    { name: "Puxada Neutra (Triângulo)", seriesTarget: 2, repsTarget: "8", note: "CLUSTER SETS" },
    { name: "Supino Reto na Barra", seriesTarget: 2, repsTarget: "5-9", note: "Meta: 5 a 9 reps" },
    { name: "Remada Baixa", seriesTarget: 2, repsTarget: "5-9", note: "Pico de contração (Isometria de 1 a 2s)" },
    { name: "Cross Polia Alta", seriesTarget: 2, repsTarget: "8-12", note: "Meta: 8 a 12 reps" },
    { name: "Barra Fixa", seriesTarget: 2, repsTarget: "FALHA", note: "Realizar até o máximo de repetições" },
    { name: "Desenvolvimento Articulado", seriesTarget: 2, repsTarget: "5-9", note: "DEAD STOP - Zere o movimento no apoio" },
    { name: "Elevação Lateral na Polia", seriesTarget: 2, repsTarget: "8-12", note: "SEM ROUBAR" },
    { name: "Rosca Direta na Barra", seriesTarget: 2, repsTarget: "5-9", note: "Movimento limpo, máxima extensão" },
    { name: "Tríceps Corda", seriesTarget: 2, repsTarget: "8-12", note: "Meta: 8 a 12 reps" },
    { name: "Abdominal na Polia", seriesTarget: 2, repsTarget: "8-12", note: "Meta: 8 a 12 reps" }
  ],
  "LOWER 2": [
    { name: "Cadeira Abdutora", seriesTarget: 2, repsTarget: "8-12", note: "Meta: 8 a 12 reps" },
    { name: "Elevação Pélvica", seriesTarget: 2, repsTarget: "5-9", note: "BOTA CARGA NISSO SEM MEDO" },
    { name: "Agachamento Sumô", seriesTarget: 2, repsTarget: "5-9", note: "Movimento o mais profundo possível" },
    { name: "Stiff na Barra", seriesTarget: 2, repsTarget: "5-9", note: "Movimento controlado" },
    { name: "Flexor de Pé", seriesTarget: 2, repsTarget: "8-12", note: "Pico de contração" },
    { name: "Panturrilha Sentado", seriesTarget: 2, repsTarget: "8-12", note: "Máxima amplitude, não roube" },
    { name: "Cadeira Extensora", seriesTarget: 2, repsTarget: "8-12", note: "Meta: 8 a 12 reps" },
    { name: "Prancha Frontal", seriesTarget: 3, repsTarget: "60s", note: "Executar por 1 minuto", isTimeBased: true }
  ]
};

const TREINO_KEYS = Object.keys(PROTOCOLO_TREINOS);
const STORAGE_KEY = "jmr_logs_v4"; // Incrementado para isolar a nova matriz de séries

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateLong(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase();
}

function storagGet(): LogEntry[] {
  try {
    const res = localStorage.getItem(STORAGE_KEY);
    return res ? JSON.parse(res) : [];
  } catch {
    return [];
  }
}

function storagSet(logs: LogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

export default function App() {
  const [screen, setScreen] = useState<string>("home");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTreino, setSelectedTreino] = useState<string>(TREINO_KEYS[0]);
  const [entries, setEntries] = useState<Record<string, ExerciseData>>({});
  const [saved, setSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [filterTreino, setFilterTreino] = useState<string>("Todos");
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  useEffect(() => {
    setLogs(storagGet());
    setLoading(false);
  }, []);

  useEffect(() => {
    const blank: Record<string, ExerciseData> = {};
    PROTOCOLO_TREINOS[selectedTreino].forEach((ex) => {
      const seriesArray: SerieData[] = [];
      for (let s = 0; s < ex.seriesTarget; s++) {
        seriesArray.push({ carga: "", reps: "" });
      }
      blank[ex.name] = { series: seriesArray, obs: "" };
    });
    setEntries(blank);
    setSaved(false);
  }, [selectedTreino]);

  function handleSerieChange(exercise: string, index: number, field: keyof SerieData, value: string) {
    setEntries((prev) => {
      const currentEx = prev[exercise];
      const updatedSeries = [...currentEx.series];
      updatedSeries[index] = { ...updatedSeries[index], [field]: value };
      return {
        ...prev,
        [exercise]: { ...currentEx, series: updatedSeries },
      };
    });
  }

  function handleObsChange(exercise: string, value: string) {
    setEntries((prev) => ({
      ...prev,
      [exercise]: { ...prev[exercise], obs: value },
    }));
  }

  function handleSave() {
    setSaving(true);
    const newLog: LogEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      treino: selectedTreino,
      exercises: { ...entries },
    };
    const updated = [newLog, ...logs];
    storagSet(updated);
    setLogs(updated);
    setSaving(false);
    setSaved(true);
  }

  function handleDeleteLog(id: number) {
    const updated = logs.filter((l) => l.id !== id);
    storagSet(updated);
    setLogs(updated);
    if (expandedLog === id) setExpandedLog(null);
  }

  function getLastLog(treino: string) {
    return logs.find((l) => l.treino === treino);
  }

  function handleExportPDF(log: LogEntry) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let rowsHTML = "";
    Object.entries(log.exercises).forEach(([exName, data], i) => {
      const isTime = PROTOCOLO_TREINOS[log.treino]?.find(p => p.name === exName)?.isTimeBased;
      data.series.forEach((s, idx) => {
        const cg = s.carga ? `${s.carga} kg` : "—";
        const rp = s.reps ? `${s.reps}${isTime ? 's' : ' reps'}` : "—";
        rowsHTML += `
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold; color: #555; text-align: center;">${idx === 0 ? String(i + 1).padStart(2, '0') : ''}</td>
            <td style="padding: 10px; font-weight: bold; color: #111;">${idx === 0 ? exName.toUpperCase() : ''}</td>
            <td style="padding: 10px; text-align: center; font-weight: bold; color: #c0392b;">SÉRIE ${idx + 1}</td>
            <td style="padding: 10px; text-align: center;">${cg}</td>
            <td style="padding: 10px; text-align: center;">${rp}</td>
            <td style="padding: 10px; font-style: italic; color: #555; font-size: 11px;">${idx === 0 ? (data.obs || '—') : ''}</td>
          </tr>
        `;
      });
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatorio_Treino_${log.treino}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 30px; color: #333; background: #fff; }
            .header { border-bottom: 3px solid #c0392b; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 32px; font-weight: 900; letter-spacing: 2px; color: #c0392b; }
            .title { font-size: 14px; color: #666; letter-spacing: 1px; text-transform: uppercase; margin: 0; font-weight: bold; }
            .meta-box { background: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 6px; margin-bottom: 25px; display: flex; justify-content: space-between; }
            .meta-item { font-size: 12px; color: #444; }
            .meta-item strong { color: #000; font-size: 14px; display: block; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #111; color: #fff; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; padding: 12px 10px; text-align: left; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 15px; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <span class="logo">JMR <span style="color:#111">TEAM</span></span>
              <p class="title" style="margin-top: 5px;">PROTOCOLO LD · RELATÓRIO DETALHADO POR SÉRIE</p>
            </div>
            <div style="text-align: right; font-size: 12px; color: #555; font-weight: bold;">GERADO EM: ${new Date(log.date).toLocaleDateString('pt-BR')}</div>
          </div>
          <div class="meta-box">
            <div class="meta-item">ROTINA ESPECÍFICA: <strong>${log.treino}</strong></div>
            <div class="meta-item">DATA DA SESSÃO: <strong>${formatDate(log.date)}</strong></div>
            <div class="meta-item">STATUS DO PROTOCOLO: <strong style="color:#27ae60">CONCLUÍDO</strong></div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 6%; text-align: center;">SEQ</th>
                <th style="width: 34%;">EXERCÍCIO ESCALADO</th>
                <th style="width: 15%; text-align: center;">PARCIAL</th>
                <th style="width: 15%; text-align: center;">CARGA</th>
                <th style="width: 15%; text-align: center;">VOLUME / TEMPO</th>
                <th style="width: 15%;">OBSERVAÇÕES</th>
              </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
          </table>
          <div class="footer">SISTEMA DE PROGRESSÃO TÉCNICA AVANÇADA DE CARGAS · JMR TEAM BRASIL</div>
          <script>
            window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  const filteredLogs =
    filterTreino === "Todos" ? logs : logs.filter((l) => l.treino === filterTreino);

  return (
    <div style={s.root}>
      <style>{fonts}</style>
      <div style={s.stickyHeader}>
        <div style={s.header}>
          <div style={s.headerInner}>
            <span style={s.logo}>JMR</span>
            <span style={s.logoSub}>TEAM</span>
          </div>
          <p style={s.headerCaption}>PROTOCOLO LD · TRACKER DE PROGRESSÃO</p>
        </div>
        <nav style={s.nav}>
          {[
            { key: "home", label: "INÍCIO" },
            { key: "register", label: "REGISTRAR" },
            { key: "history", label: "HISTÓRICO" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setScreen(tab.key); setSaved(false); }}
              style={{ ...s.navBtn, ...(screen === tab.key ? s.navBtnActive : {}) }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div style={s.contentScroll}>
        {screen === "home" && (
          <HomeScreen logs={logs} goToTreino={(t) => { setSelectedTreino(t); setScreen("register"); }} getLastLog={getLastLog} />
        )}
        {screen === "register" && (
          <RegisterScreen
            selectedTreino={selectedTreino}
            setSelectedTreino={setSelectedTreino}
            entries={entries}
            handleSerieChange={handleSerieChange}
            handleObsChange={handleObsChange}
            handleSave={handleSave}
            saved={saved}
            saving={saving}
            logs={logs}
          />
        )}
        {screen === "history" && (
          <HistoryScreen
            logs={filteredLogs}
            allLogs={logs}
            filterTreino={filterTreino}
            setFilterTreino={setFilterTreino}
            expandedLog={expandedLog}
            setExpandedLog={setExpandedLog}
            handleDeleteLog={handleDeleteLog}
            handleExportPDF={handleExportPDF}
          />
        )}
      </div>
    </div>
  );
}

function HomeScreen({ logs, goToTreino, getLastLog }: { logs: LogEntry[]; goToTreino: (t: string) => void; getLastLog: (t: string) => LogEntry | undefined }) {
  return (
    <div style={s.section}>
      <p style={s.sectionTitle}>TREINO DE HOJE</p>
      <div style={s.cardGrid}>
        {TREINO_KEYS.map((t) => {
          const last = getLastLog(t);
          return (
            <button key={t} style={s.treinoCard} onClick={() => goToTreino(t)}>
              <span style={s.treinoCardName}>{t}</span>
              <span style={s.treinoCardSub}>{PROTOCOLO_TREINOS[t].length} exercícios</span>
              {last ? (
                <span style={s.treinoCardLast}>Último: {formatDate(last.date)}</span>
              ) : (
                <span style={s.treinoCardNew}>Nunca registrado</span>
              )}
            </button>
          );
        })}
      </div>
      <div style={s.statRow}>
        <div style={s.statBox}>
          <span style={s.statNum}>{logs.length}</span>
          <span style={s.statLabel}>Treinos salvos</span>
        </div>
        <div style={s.statBox}>
          <span style={s.statNum}>{[...new Set(logs.map((l) => l.treino))].length}</span>
          <span style={s.statLabel}>Tipos treinados</span>
        </div>
        <div style={s.statBox}>
          <span style={s.statNum}>{logs.length > 0 ? formatDate(logs[0].date).slice(0, 5) : "—"}</span>
          <span style={s.statLabel}>Último treino</span>
        </div>
      </div>
      <div style={s.motivBox}>
        <p style={s.motivText}>"O SACRIFÍCIO É O INTERVALO ENTRE O OBJETIVO E A GLÓRIA"</p>
      </div>
    </div>
  );
}

interface RegisterProps {
  selectedTreino: string;
  setSelectedTreino: (t: string) => void;
  entries: Record<string, ExerciseData>;
  handleSerieChange: (ex: string, idx: number, f: keyof SerieData, v: string) => void;
  handleObsChange: (ex: string, v: string) => void;
  handleSave: () => void;
  saved: boolean;
  saving: boolean;
  logs: LogEntry[];
}

function RegisterScreen({ selectedTreino, setSelectedTreino, entries, handleSerieChange, handleObsChange, handleSave, saved, saving, logs }: RegisterProps) {
  const prevLog = logs.find((l) => l.treino === selectedTreino);

  return (
    <div style={s.section}>
      <p style={s.sectionTitle}>REGISTRAR TREINO</p>
      <div style={s.tabRow}>
        {TREINO_KEYS.map((t) => (
          <button key={t} onClick={() => setSelectedTreino(t)} style={{ ...s.tabBtn, ...((selectedTreino === t) ? s.tabBtnActive : {}) }}>
            {t}
          </button>
        ))}
      </div>
      <p style={s.dateLabel}>{formatDateLong(new Date().toISOString())}</p>
      {prevLog && (
        <div style={s.prevBanner}>
          <span>📋 Última sessão: {formatDate(prevLog.date)} — supere essa!</span>
        </div>
      )}
      <div style={s.exerciseList}>
        {PROTOCOLO_TREINOS[selectedTreino].map((ex, i) => {
          const prev = prevLog?.exercises?.[ex.name];
          const currentEntry = entries[ex.name] || { series: [], obs: "" };

          return (
            <div key={ex.name} style={s.exerciseCard}>
              <div style={s.exHeader}>
                <span style={s.exNum}>{String(i + 1).padStart(2, "0")}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={s.exName}>{ex.name.toUpperCase()}</span>
                  <span style={{ fontSize: 10, color: RED, fontWeight: 700, letterSpacing: 0.5 }}>
                    🎯 TARGET: {ex.seriesTarget} SÉRIES × {ex.repsTarget} {ex.isTimeBased ? "" : "REPS"} · {ex.note.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Histórico linear anterior completo da sessão passada */}
              {prev && prev.series && (
                <div style={s.prevRowDynamic}>
                  <p style={{ color: "#555", fontWeight: 700, marginBottom: 2 }}>Sessão Anterior:</p>
                  {prev.series.map((sData, sIdx) => (
                    <span key={sIdx} style={{ color: "#999", marginRight: 12, display: "inline-block" }}>
                      [Sé{sIdx + 1}: {sData.carga || "0"}kg × {sData.reps || "0"}{ex.isTimeBased ? "s" : ""}]
                    </span>
                  ))}
                  {prev.obs && <p style={{ color: "#666", fontStyle: "italic", marginTop: 2 }}>Obs antiga: {prev.obs}</p>}
                </div>
              )}

              {/* Renderização das linhas individuais para cada série prevista */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                {currentEntry.series.map((serie, idx) => {
                  const prevCarga = prev?.series?.[idx]?.carga || "0";
                  const prevReps = prev?.series?.[idx]?.reps || ex.repsTarget.split("-")[0];

                  return (
                    <div key={idx} style={s.serieInputRow}>
                      <span style={s.serieLabelIndicator}>SÉRIE {idx + 1}</span>
                      <div style={{ flex: 1, display: "flex", gap: 8 }}>
                        <input
                          style={s.input}
                          type="number"
                          inputMode="decimal"
                          placeholder={`${prevCarga} kg`}
                          value={serie.carga}
                          onChange={(e) => handleSerieChange(ex.name, idx, "carga", e.target.value)}
                          autoComplete="off"
                        />
                        <input
                          style={s.input}
                          type="number"
                          inputMode="numeric"
                          placeholder={`${prevReps} ${ex.isTimeBased ? "s" : ""}`}
                          value={serie.reps}
                          onChange={(e) => handleSerieChange(ex.name, idx, "reps", e.target.value)}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  );
                })}

                <div style={s.inputGroup}>
                  <label style={s.inputLabel}>OBSERVAÇÃO DA SESSÃO</label>
                  <input
                    style={s.input}
                    type="text"
                    placeholder="ex: boa execução, drop set na última..."
                    value={currentEntry.obs}
                    onChange={(e) => handleObsChange(ex.name, e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {saved ? (
        <div style={s.savedBanner}>✅ SESSÃO TÉCNICA SALVA COM SUCESSO!</div>
      ) : (
        <button style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
          {saving ? "PROCESSANDO..." : "CONCLUIR TREINO"}
        </button>
      )}
    </div>
  );
}

function HistoryScreen({ logs, allLogs, filterTreino, setFilterTreino, expandedLog, setExpandedLog, handleDeleteLog, handleExportPDF }: { logs: LogEntry[]; allLogs: LogEntry[]; filterTreino: string; setFilterTreino: (t: string) => void; expandedLog: number | null; setExpandedLog: (id: number | null) => void; handleDeleteLog: (id: number) => void; handleExportPDF: (log: LogEntry) => void }) {
  
  function renderMiniChart(exerciseName: string) {
    // Pega a média de carga das séries executadas para montar a linha de evolução histórica
    const historicalData = [...allLogs]
      .reverse()
      .map((l) => {
        const series = l.exercises[exerciseName]?.series || [];
        const cargasValidas = series.map(s => Number(s.carga) || 0).filter(v => v > 0);
        const mediaCarga = cargasValidas.length > 0 ? Math.round(cargasValidas.reduce((a, b) => a + b, 0) / cargasValidas.length) : 0;
        return { date: formatDate(l.date).slice(0, 5), val: mediaCarga };
      })
      .filter((d) => d.val > 0)
      .slice(-5);

    if (historicalData.length < 2) return null;
    const maxCarga = Math.max(...historicalData.map((d) => d.val), 1);

    return (
      <div style={s.chartContainer}>
        <p style={s.chartTitle}>Evolução Média de Carga (Últimas Sessões)</p>
        <div style={s.chartTrack}>
          {historicalData.map((d, i) => {
            const pct = (d.val / maxCarga) * 100;
            return (
              <div key={i} style={s.chartBarWrap}>
                <span style={s.chartBarNum}>{d.val}k</span>
                <div style={{ ...s.chartBarFill, height: `${Math.max(pct, 15)}%` }} />
                <span style={s.chartBarLabel}>{d.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={s.section}>
      <p style={s.sectionTitle}>MÉTRICAS HISTÓRICAS</p>
      <div style={s.tabRow}>
        {["Todos", ...TREINO_KEYS].map((t) => (
          <button key={t} onClick={() => setFilterTreino(t)} style={{ ...s.tabBtn, ...((filterTreino === t) ? s.tabBtnActive : {}) }}>
            {t === "Todos" ? "TODOS" : t}
          </button>
        ))}
      </div>
      {logs.length === 0 && (
        <div style={s.emptyState}>
          <p style={s.emptyText}>Sem registros técnicos até o momento.</p>
          <p style={s.emptyHype}>VAI LÁ E BOTA CARGA! 💪</p>
        </div>
      )}
      <div style={s.logList}>
        {logs.map((log) => (
          <div key={log.id} style={s.logCard}>
            <div style={s.logHeader} onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
              <div style={s.logHeaderFlexContainer}>
                <span style={s.logTreino}>{log.treino}</span>
                <span style={s.logDate}>{formatDate(log.date)}</span>
              </div>
              <span style={s.logChevron}>{expandedLog === log.id ? "▲" : "▼"}</span>
            </div>
            {expandedLog === log.id && (
              <div style={s.logDetail}>
                <button style={s.pdfExportBtn} onClick={() => handleExportPDF(log)}>
                  📄 EXPORTAR RELATÓRIO EM PDF
                </button>
                {Object.entries(log.exercises).map(([ex, data]) => {
                  const isTime = PROTOCOLO_TREINOS[log.treino]?.find(p => p.name === ex)?.isTimeBased;
                  
                  // Monta as linhas lineares por série conforme solicitado
                  const seriesLine = data.series.map((sData, sIdx) => {
                    const cg = sData.carga ? `${sData.carga}kg` : "0kg";
                    const rp = sData.reps ? `${sData.reps}${isTime ? "s" : " reps"}` : "0";
                    return `S${sIdx + 1}: ${cg} × ${rp}`;
                  }).join(" · ");

                  const obsText = data.obs ? ` · (${data.obs})` : "";
                  
                  return (
                    <div key={ex} style={s.logExBlock}>
                      <p style={s.logExNameClean}>{ex.toUpperCase()}</p>
                      <p style={s.logExDataLine}>
                        {seriesLine}{obsText}
                      </p>
                      {renderMiniChart(ex)}
                    </div>
                  );
                })}
                <button style={s.deleteBtn} onClick={() => { if(window.confirm("Excluir?")) handleDeleteLog(log.id); }}>
                  DELETAR SESSÃO
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
  body { background: #0a0a0a; overflow-x: hidden; width: 100%; }
  input { outline: none; border: 1px solid #1e1e1e; }
  input:focus { border-color: #c0392b !important; }
  
  button, input, select, textarea {
    -webkit-tap-highlight-color: transparent !important;
    outline: none !important;
    box-shadow: none !important;
  }
  button:focus, button:active, .tabBtn:focus, .tabBtn:active {
    outline: none !important;
    box-shadow: none !important;
    border-color: transparent !important;
    background: none;
  }
`;

const RED = "#c0392b";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#1e1e1e";
const TEXT = "#e8e8e8";

const s: Record<string, React.CSSProperties> = {
  root: { background: BG, minHeight: "100vh", width: "100%", maxWidth: "520px", margin: "0 auto", display: "flex", flexDirection: "column", color: TEXT, fontFamily: "'DM Sans', sans-serif" },
  stickyHeader: { position: "sticky", top: 0, zIndex: 100, background: BG, borderBottom: `1px solid ${BORDER}`, width: "100%" },
  header: { background: "linear-gradient(135deg, #0a0a0a 0%, #1a0505 100%)", padding: "20px 20px 14px", textAlign: "center" },
  headerInner: { display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 },
  logo: { fontFamily: "'Bebas Neue', cursive", fontSize: 48, color: RED, letterSpacing: 4, lineHeight: 0.9 },
  logoSub: { fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: TEXT, letterSpacing: 6 },
  headerCaption: { fontSize: 10, letterSpacing: 3, color: "#555", marginTop: 6, fontWeight: 700 },
  
  nav: { display: "flex", background: "#0d0d0d", border: "none", outline: "none" },
  navBtn: { flex: 1, background: "none", border: "none", outline: "none", color: "#555", padding: "14px 0", fontSize: 12, fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, cursor: "pointer", borderBottom: "3px solid transparent", transition: "all 0.15s ease" },
  navBtnActive: { color: TEXT, borderBottom: `3px solid ${RED}`, background: "none", outline: "none" },
  
  contentScroll: { padding: "0 16px 40px 16px", flex: 1, display: "flex", flexDirection: "column" },
  section: { paddingTop: 20, flex: 1, display: "flex", flexDirection: "column" },
  sectionTitle: { fontFamily: "'Bebas Neue', cursive", fontSize: 24, letterSpacing: 3, color: TEXT, marginBottom: 18, borderLeft: `3px solid ${RED}`, paddingLeft: 12 },
  cardGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 },
  treinoCard: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "16px 14px", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 4 },
  treinoCardName: { fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: TEXT },
  treinoCardSub: { fontSize: 12, color: "#555" },
  treinoCardLast: { fontSize: 10, color: "#27ae60", marginTop: 6, fontWeight: 700 },
  treinoCardNew: { fontSize: 10, color: RED, marginTop: 6, fontWeight: 700 },
  statRow: { display: "flex", gap: 12, marginBottom: 20 },
  statBox: { flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: 16, display: "flex", flexDirection: "column", alignItems: "center" },
  statNum: { fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: RED },
  statLabel: { fontSize: 10, color: "#555", textAlign: "center" },
  motivBox: { border: `1px solid #1f0808`, borderRadius: 6, padding: "18px 16px", textAlign: "center", background: "#0d0505", marginBottom: 20 },
  motivText: { fontFamily: "'Bebas Neue', cursive", fontSize: 16, letterSpacing: 2, color: RED },
  
  tabRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  tabBtn: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, color: "#555", padding: "6px 12px", fontSize: 12, fontFamily: "'Bebas Neue', cursive", cursor: "pointer", outline: "none", borderBottom: "none" },
  tabBtnActive: { background: RED, borderColor: RED, color: "#fff", outline: "none" },
  
  dateLabel: { fontSize: 12, color: RED, marginBottom: 12, fontWeight: 800 },
  prevBanner: { background: "rgba(39, 174, 96, 0.05)", border: "1px solid #27ae60", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "#4fa34f", marginBottom: 16 },
  exerciseList: { display: "flex", flexDirection: "column", gap: 12 },
  exerciseCard: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "14px 16px" },
  exHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
  exNum: { fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: RED, minWidth: 28 },
  exName: { fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: TEXT },
  prevRowDynamic: { background: "#0d0d0d", borderRadius: 4, padding: "6px 10px", fontSize: 11, marginBottom: 12, border: "1px solid #141414" },
  
  // Estilos da linha de entrada das séries individuais
  serieInputRow: { display: "flex", alignItems: "center", gap: 12, background: "#0d0d0d", padding: "6px 10px", borderRadius: 5, border: "1px solid #141414" },
  serieLabelIndicator: { fontSize: 10, fontFamily: "'Bebas Neue', cursive", color: RED, letterSpacing: 1, minWidth: 55 },
  
  inputGroup: { flex: 1, display: "flex", flexDirection: "column", gap: 5, marginTop: 4 },
  inputLabel: { fontSize: 9, color: "#555", fontWeight: 800 },
  input: { background: BG, border: `1px solid ${BORDER}`, borderRadius: 5, color: TEXT, padding: "8px 10px", fontSize: 16, width: "100%", fontWeight: 600 },
  saveBtn: { width: "100%", background: RED, border: "none", borderRadius: 6, color: "#fff", padding: "18px", fontFamily: "'Bebas Neue', cursive", fontSize: 20, cursor: "pointer" },
  savedBanner: { background: "rgba(39, 174, 96, 0.1)", border: "1px solid #27ae60", borderRadius: 6, padding: "18px", textAlign: "center", color: "#4fa34f", fontFamily: "'Bebas Neue', cursive", fontSize: 18 },
  emptyState: { textAlign: "center", padding: "80px 0" },
  emptyText: { color: "#555", fontSize: 14 },
  emptyHype: { fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: RED },
  
  logList: { display: "flex", flexDirection: "column", gap: 10 },
  logCard: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden" },
  logHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", cursor: "pointer" },
  logHeaderFlexContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "92%" },
  logTreino: { fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: TEXT, letterSpacing: "0.5px" },
  logDate: { fontSize: 12, color: "#666", fontWeight: 500 },
  logChevron: { color: "#555", fontSize: 12 },
  logDetail: { borderTop: `1px solid ${BORDER}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14, background: "#0a0a0a" },
  logExBlock: { borderBottom: "1px solid #141414", paddingBottom: 12, paddingTop: 4 },
  logExNameClean: { fontSize: 12, color: TEXT, fontWeight: 700, marginBottom: 4, letterSpacing: "0.5px" },
  logExDataLine: { fontSize: 12, color: "#b3b3b3", lineHeight: "1.4" },
  pdfExportBtn: { width: "100%", background: "none", border: `1px solid ${RED}`, borderRadius: 6, color: TEXT, padding: "12px", fontFamily: "'Bebas Neue', cursive", fontSize: 14, cursor: "pointer", marginBottom: 6 },
  chartContainer: { marginTop: 10, background: "#0d0d0d", padding: "8px 10px", borderRadius: 4, border: "1px solid #141414" },
  chartTitle: { fontSize: 9, color: "#555", textTransform: "uppercase" },
  chartTrack: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 45, gap: 6 },
  chartBarWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" },
  chartBarNum: { fontSize: 8, color: "#888" },
  chartBarFill: { width: "100%", maxWidth: 20, background: `linear-gradient(180deg, ${RED} 0%, #7f2217 100%)`, borderRadius: "2px 2px 0 0" },
  chartBarLabel: { fontSize: 8, color: "#555" },
  deleteBtn: { background: "none", border: `1px solid rgba(192,57,43,0.3)`, borderRadius: 4, color: RED, padding: "8px 14px", fontSize: 10, cursor: "pointer", marginTop: 10 },
};