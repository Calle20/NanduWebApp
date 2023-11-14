<script>
    export let id;
    export let ledGrid;
    let toogle = () => {
        $ledGrid[id].isOn = !$ledGrid[id].isOn;
    };
</script>

<div
    class="led no-select"
    on:mousedown={toogle}
    style="opacity: {$ledGrid[id].isActive ? 1 : 0}; background:{$ledGrid[id]
        .isOn
        ? '#198754'
        : 'red'}"
/>

<style>
    .led {
        border: 2px solid #272727;
        height: calc(2px + max(5vmin, 50px));
        width: 5vmin;
        border-radius: calc(max(5vmin, 50px) / 6.25);
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }
</style>
