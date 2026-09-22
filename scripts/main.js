/**
 * Trilha — trocar de música sem sobrepor.
 *
 * Numa playlist sequencial ou aleatória, escolher outra música à mão fazia a nova
 * começar enquanto a anterior ainda saía (o Foundry faz as duas coisas ao mesmo
 * tempo; o crossfade do The Sound of Silence sobrepõe-nas de propósito). O Tiago quer
 * a anterior a sair por inteiro e só depois a nova a entrar.
 *
 * Por isso: parar as que estão a tocar (o Foundry desvanece-as em todos os clientes,
 * com o `fade` da playlist) e tocar a pedida quando a saída já vai no fim — 75% por
 * defeito. Esperar a saída inteira deixava um buraco de silêncio (0.1.0): a nova só
 * começava com a anterior já calada, e o fade-in ainda demorava a fazer-se ouvir.
 * Assim as caudas tocam-se: a nova nasce por baixo do fim da anterior.
 * A entrada usa o «Fade in» do The Sound of Silence (curva em S soa melhor que a logarítmica).
 *
 * Só o mestre decide; os jogadores recebem as duas mudanças pelo Foundry, em sincronia.
 */
const MODULE_ID = "tiagos-toolkit-trilha";
const esperas = new Map();   // playlist → som pedido enquanto a anterior sai

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "sairAntes", {
    name: "TRILHA.Config.SairAntes", hint: "TRILHA.Config.SairAntesHint",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register(MODULE_ID, "entrada", {
    name: "TRILHA.Config.Entrada", hint: "TRILHA.Config.EntradaHint",
    scope: "world", config: true, type: Number, default: 75,
    range: { min: 0, max: 100, step: 5 }
  });
});

Hooks.once("setup", () => {
  if (!globalThis.libWrapper) {
    console.warn(`${MODULE_ID} | libWrapper em falta — a troca sem sobreposição fica desligada`);
    return;
  }
  const { SEQUENTIAL, SHUFFLE } = CONST.PLAYLIST_MODES;
  libWrapper.register(MODULE_ID, "Playlist.prototype.playSound", async function (wrapped, som, ...args) {
    const fade = this.fade ?? 0;
    const outras = this.sounds.filter((s) => s.playing && s.id !== som?.id);
    const aplica = game.user.isGM && game.settings.get(MODULE_ID, "sairAntes") &&
      fade > 0 && outras.length && [SEQUENTIAL, SHUFFLE].includes(this.mode);
    if (!aplica) return wrapped(som, ...args);

    esperas.set(this.id, som.id);
    await this.updateEmbeddedDocuments("PlaylistSound",
      outras.map((s) => ({ _id: s.id, playing: false, pausedTime: null })));
    const entrada = Math.min(100, Math.max(0, game.settings.get(MODULE_ID, "entrada") ?? 75)) / 100;
    await new Promise((r) => setTimeout(r, fade * entrada));
    // o mestre pode ter escolhido outra música enquanto esta esperava: vale a última
    if (esperas.get(this.id) !== som.id) return this;
    esperas.delete(this.id);
    return wrapped(som, ...args);
  }, "MIXED");
});
