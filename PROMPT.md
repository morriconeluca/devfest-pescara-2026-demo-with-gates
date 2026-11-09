# Il Terminale dell'Operatore

In questa codebase voglio realizzare una Single Page Application React a tema Matrix in pochi minuti usando Tailwind. L'app è il Terminale dell'Operatore: un finto terminale di comando di Zion dove l'utente può "hackerare" la matrice.

Cosa fa: Una schermata nera con testo verde fosforescente a scorrimento (stile macchina da scrivere).

Interazione: L'utente può digitare comandi reali nella console per ottenere risposte dal sistema:

- help → Mostra la lista dei comandi disponibili.
- matrix → Avvia l'effetto visivo del codice binario che cade dall'alto verso il basso dello schermo, coprendolo interamente. I caratteri iniziali cadono lentamente per poi accelerare progressivamente, fino a coprire interamente lo schermo.
- knock → Mostra sul display il testo "Knock, knock, Neo...".
- whoami → Risponde "Tu sei l'Eletto".

Tu sei l'orchestratore. Per ogni task apri una nuova tab herdr con una nuova sessione di pi agent che usi il modello gemini-3.8-flash-high. A task completato non chiudere la tab. Verificalo e se corrisponde ai requisiti committa. Diversamente assegna le fix a un nuovo sub-agente/tab. Pianifica i task in modo da poterli gestire in parallelo su diversi worktree git e con diversi sub-agenti. Comincia col costruire l'architettura complessiva e poi scendi via via nei dettagli implementativi, in modo da separare subito le aree di competenza dei vari agenti e minimizzare i conflitti tra i sub-agenti. Distruggi i worktree una volta che il relativo codice è stato mergiato nel main.

Assicurati che ogni sub-agente, prima di eseguire il suo task, legga la skill solve-problem. Per considerare concluso un task, ogni sub-agente dovrà anche eseguire e far superare tutti i gate da 1 a 5. I sub agenti devono eseguire il gate:4 unicamente con il comando gate:4:diff. Tu, che sei l'orchestratore, sei l'unico a dover eseguire il gate:4:incremental prima dei commit.
