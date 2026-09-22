# Tiago's Toolkit: Trilha

Trocar de música sem sobrepor. Numa playlist **sequencial** ou **aleatória**, escolher outra música faz a
atual **desvanecer por inteiro** e só depois começa a nova — em vez de as duas se cruzarem.

- A saída dura o **Fade** da playlist.
- A nova começa quando a saída vai em **75%** (ajustável): as caudas tocam-se, sem buraco de silêncio.
- A entrada usa o **Fade in** do The Sound of Silence (se estiver a 0, a nova entra de uma vez).
  Recomendado: *Fade-In Curve Type* = **S-Curve** — a logarítmica fica quase muda na primeira metade.
- Desligar: *Definições do módulo → A música anterior sai antes de a nova entrar*.
- Requer **libWrapper**.

```
https://github.com/Th1rdo/tiagos-toolkit-trilha/releases/latest/download/module.json
```
