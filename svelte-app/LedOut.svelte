<script>
    export let id;
    export let ledGridOut;
</script>

<div
    class="led no-select"
    style="opacity: {~~$ledGridOut[id].isActive}; background:{$ledGridOut[id]
        .isOn
        ? '#198754'
        : 'red'}"
>
    <h4 class="centerLetter">L</h4>
</div>

<style>
    .led {
        border: 2px solid #272727;
        height: calc(2px + max(5vmin, 50px));
        width: calc(max(5vmin, 50px));
        border-radius: calc(max(5vmin, 50px) / 6.25);
        border-top-right-radius: 0;
        border-top-left-radius: 0;
    }
</style>
