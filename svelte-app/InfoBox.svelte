<script>
    import Help_outline from "svelte-google-materialdesign-icons/Help_outline.svelte";
</script>

<div style="min-height: 22em">
    <div class="collapse collapse-horizontal" id="collapseWidthExample">
        <div class="card card-body" style="width: 350px">
            <h3>1. Erstellen</h3>
            Sie können die Bausteine von rechts in die Felder ziehen und auf ein
            Feld drücken, um es zu einer Ausgabe-LED zu machen.
            <h3>2. Simulieren</h3>
            Wenn Sie nun auf den "Run"-button klicken, beziehungsweise die Enter-Taste
            drücken, gelangen Sie in den Simulationsmodus. Sie können mit dem Klicken
            auf die nun erschienenen oberen Eingabe-LED's das Programm simulieren
            und sehen, wie sich die anderen LED's ändern. Wenn Sie nun eine Änderung
            vornehmen, werden Sie zurück zum Bau-Modus gebracht.
        </div>
    </div>
</div>

<p>
    <button
        class="btn btn-primary"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseWidthExample"
        aria-expanded="false"
        aria-controls="collapseWidthExample"
    >
        <div inert>
            <Help_outline />
        </div>
    </button>
</p>
