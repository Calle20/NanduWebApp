<script>
    import Help_outline from "svelte-google-materialdesign-icons/Help_outline.svelte";
</script>

<div style="min-height: 22em;">
    <div class="collapse collapse-horizontal" id="collapse">
        <div class="card card-body" style="width: 28vw">
            <h3>1. Baumodus</h3>
            Die Bausteine können aus der Ablage rechts auf die Felder gezogen werden. 
            Wenn man auf ein Feld klickt, wird aus diesem eine Ausgabe-LED, gekennzeichnet durch den Buchstaben L. 
            Bei erneutem Klicken wird aus diesem Feld eine Lichtquelle, gekennzeichnet durch den Buchstaben Q.
            <h3>2. Simulationsmodus</h3>
            Durch das Klicken auf die grüne Pfeil-Schaltfläche oder das Betätigen der Enter-Taste gelangt man in den Simulationsmodus.
            Falls in der obersten Reihe Bausteine vorhanden sind, erscheinen darüber Lichtquellen. Man kann jetzt durch Klicken
            auf die oberen oder die im Baumodus selbst erstellten Lichtquellen diese an- und ausschalten und damit die erstellte Konstruktion testen. 
            Wie bei den Lichtquellen erscheinen, falls in der untersten Reihe Bausteine vorhanden sind, darunter automatisch Ausgabe-LED's. 
            Diese, oder die im Baumodus erstellten Ausgabe-LED's L zeigen jetzt den Zustand an dieser Stelle an. (Rot/Grün - Aus/An)
            Wenn man im Simulationsmodus eine Änderung an der Konstruktion vornimmt, die Escape-Taste betätigt oder auf die graue Schaltfläche mit dem Bausymbol klickt, 
            befindet man sich wieder im Baumodus.
        </div>
    </div>
</div>

<p>
    <button
        class="btn btn-primary"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapse"
        aria-expanded="false"
        aria-controls="collapse"
    >
        <div inert>
            <Help_outline />
        </div>
    </button>
</p>