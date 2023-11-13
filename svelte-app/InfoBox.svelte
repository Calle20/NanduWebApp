<script>
    import Help_outline from "svelte-google-materialdesign-icons/Help_outline.svelte";
</script>

<div
    class="modal fade text-bg-dark"
    data-bs-theme="dark"
    id="exampleModalToggle"
    aria-hidden="true"
    aria-labelledby="exampleModalToggleLabel"
    tabindex="-1"
>
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalToggleLabel">
                    1. Baumodus
                </h1>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                />
            </div>
            <div class="modal-body">
                <p>
                    Die Bausteine können aus der Ablage rechts auf die Felder
                    gezogen werden. Wenn man auf ein Feld klickt, wird aus
                    diesem eine Ausgabe-LED, gekennzeichnet durch den Buchstaben
                    L. Bei erneutem Klicken wird aus diesem Feld eine
                    Lichtquelle, gekennzeichnet durch den Buchstaben Q.
                </p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline-danger" data-bs-dismiss="modal"
                    >Schließen</button
                >
                <button
                    class="btn btn-primary"
                    data-bs-target="#exampleModalToggle2"
                    data-bs-toggle="modal">Weiter</button
                >
            </div>
        </div>
    </div>
</div>
<div
    class="modal fade text-bg-dark"
    data-bs-theme="dark"
    id="exampleModalToggle2"
    aria-hidden="true"
    aria-labelledby="exampleModalToggleLabel2"
    tabindex="-1"
>
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalToggleLabel2">
                    2. Simulationsmodus
                </h1>
                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                />
            </div>
            <div class="modal-body">
                <p>
                    Durch das Klicken auf die grüne Pfeil-Schaltfläche oder das
                    Betätigen der Enter-Taste gelangt man in den
                    Simulationsmodus.
                </p>
                <p>
                    Falls in der obersten Reihe Bausteine vorhanden sind,
                    erscheinen darüber Lichtquellen. Man kann jetzt durch
                    Klicken auf die oberen oder die im Baumodus selbst
                    erstellten Lichtquellen diese an- und ausschalten und damit
                    die erstellte Konstruktion testen.
                </p>
                <p>
                    Wie bei den Lichtquellen, falls in der untersten Reihe
                    Bausteine vorhanden sind, erscheinen darunter automatisch
                    Ausgabe-LEDs. Diese, oder die im Baumodus erstellten
                    Ausgabe-LEDs (L), zeigen jetzt den Zustand an dieser Stelle
                    an. (Rot/Grün - Aus/An)
                </p>
                <p>
                    Wenn man im Simulationsmodus eine Änderung an der
                    Konstruktion vornimmt, die Escape-Taste betätigt oder auf
                    die graue Schaltfläche mit dem Bausymbol klickt, befindet
                    man sich wieder im Baumodus.
                </p>
            </div>
            <div class="modal-footer">
                <button
                    class="btn btn-primary"
                    data-bs-target="#exampleModalToggle"
                    data-bs-toggle="modal">Zurück</button
                >
                <button class="btn btn-outline-danger" data-bs-dismiss="modal"
                    >Schließen</button
                >
            </div>
        </div>
    </div>
</div>
<button
    class="btn btn-primary btn-lg"
    data-bs-target="#exampleModalToggle"
    data-bs-toggle="modal"
>
    <div inert>
        <Help_outline />
        Hilfe
    </div></button
>
