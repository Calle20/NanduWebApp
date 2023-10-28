<script>
    export let id;
    // export let isOn;
    export let ledGrid;
    let toogle = () => {
        $ledGrid[id].isOn = !$ledGrid[id].isOn;
    };
    console.log($ledGrid);
</script>

<div
    class="led no-select"
    on:mousedown={toogle}
    style="opacity: {$ledGrid[id].isActive ? 1 : 0}; background:{$ledGrid[id]
        .isOn
        ? '#198754'
        : '#404040'}"
>
    <!-- <h4>{id}</h4> -->
</div>

<style>
    .led {
        border: 2px solid #272727;
        height: calc(2px + min(5vmin, 50px));
        width: 5vmin;
        border-radius: calc(min(5vmin, 50px) / 6.25);
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }
</style>
