<script>
    export let id;
    // export let isOn;
    export let ledGrid;
    let toogle = () => {
        ledGrid[id].isOn = !ledGrid[id].isOn;
    };
</script>

<div
    class="led no-select"
    on:mousedown={toogle}
    style="background:{ledGrid[id].isOn ? '#198754' : 'red'}"
>
    <h4>{id}</h4>
</div>

<style>
    .led {
        border: 1px solid #272727;
        height: calc(2px + min(5vmin, 50px));
        width: 5vmin;
        border-radius: calc(min(5vmin, 50px) / 6.25);
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }
</style>
