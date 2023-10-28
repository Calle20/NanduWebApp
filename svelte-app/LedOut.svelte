<script>
    export let id;
    export let ledGridOut;

    console.log($ledGridOut[id]);
</script>

<div
    class="led no-select"
    style="opacity: {~~$ledGridOut[id].isActive}; background:{$ledGridOut[id]
        .isOn
        ? '#198754'
        : 'red'}"
>
    <!-- don't ask for the "~~" -->
    <h4>{id}</h4>
</div>

<style>
    .led {
        border: 2px solid #272727;
        height: calc(2px + min(5vmin, 50px));
        width: 5vmin;
        border-radius: calc(min(5vmin, 50px) / 6.25);
        border-top-right-radius: 0;
        border-top-left-radius: 0;
    }
</style>
