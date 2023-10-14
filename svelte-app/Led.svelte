<script>
    export let id;
    export let isOn;
    let toogle = () => {
        isOn = !isOn;
    };

    $: changeColor = () => {
        if (isOn) {
        }
    };
</script>

<div
    class="led"
    on:mousedown={toogle}
    style="background:{isOn ? 'green' : 'red'}"
>
    <h4>{id}</h4>
</div>

<style>
    .led {
        border: 1px solid #272727;
        height: calc(2px + min(5vmin, 50px));
        width: 5vmin;
        border-radius: calc(min(5vmin, 50px) / 6.25);
    }
</style>
