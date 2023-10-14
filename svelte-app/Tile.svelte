<script>
    export let letter;
    export let id;
</script>

<div class="{id} square">
    <div class="letter no-select">
        {letter.toUpperCase()}
    </div>
</div>

<style>
    .square {
        height: calc(min(5vmin, 50px));
        width: calc(10vmin - 2px);
        border-radius: calc(min(5vmin, 50px) / 6.25);
        display: flex;
        align-items: center;
        justify-content: center;
        /* background-color: #ffebeb; */
    }

    .letter {
        font-size: 2vmin;
        color: #707070;
    }
</style>
