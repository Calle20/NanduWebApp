<script>
    import {
        dndzone,
        TRIGGERS,
        SOURCES,
        DRAGGED_ELEMENT_ID,
    } from "svelte-dnd-action";
    import { flip } from "svelte/animate";
    import { tick } from "svelte";
    import { writable } from "svelte/store";

    // import { selectedItems } from "./selectionStore";
    const flipDurationMs = 120;

    export let items = [];

    const selectedItems = new writable({
        1: { id: "1", title: "I" },
        2: { id: "2", title: "Am" },
    });

    function handleConsider(e) {
        // const {
        //     items: newItems,
        //     info: { trigger, source, id },
        // } = e.detail;
        // if (source !== SOURCES.KEYBOARD) {
        //     if (
        //         Object.keys($selectedItems).length &&
        //         trigger === TRIGGERS.DRAG_STARTED
        //     ) {
        //         if (Object.keys($selectedItems).includes(id)) {
        //             $selectedItems = { ...$selectedItems };
        //             tick().then(() => {
        //                 items = newItems.filter(
        //                     (item) =>
        //                         !Object.keys($selectedItems).includes(item.id)
        //                 );
        //             });
        //         }
        //     }
        // }
        items = e.detail.items;
    }
    function handleFinalize(e) {
        let {
            items: newItems,
            info: { trigger, id },
        } = e.detail;
        if (Object.keys($selectedItems).length) {
            if (trigger === TRIGGERS.DROPPED_INTO_ANOTHER) {
                items = newItems.filter(
                    (item) => !Object.keys($selectedItems).includes(item.id)
                );
            } else if (
                trigger === TRIGGERS.DROPPED_INTO_ZONE ||
                trigger === TRIGGERS.DROPPED_OUTSIDE_OF_ANY
            ) {
                tick().then(() => {
                    const idx = newItems.findIndex((item) => item.id === id);
                    // to support arrow up when keyboard dragging
                    const sidx = Math.max(
                        Object.values($selectedItems).findIndex(
                            (item) => item.id === id
                        ),
                        0
                    );
                    newItems = newItems.filter(
                        (item) => !Object.keys($selectedItems).includes(item.id)
                    );
                    newItems.splice(
                        idx - sidx,
                        0,
                        ...Object.values($selectedItems)
                    );
                    items = newItems;
                });
            }
        } else {
            items = newItems;
        }
    }
</script>

<section
    use:dndzone={{ items, flipDurationMs }}
    on:consider={handleConsider}
    on:finalize={handleFinalize}
>
    {#each items as item (item.id)}
        <div
            animate:flip={{ duration: flipDurationMs }}
            class:selected={Object.keys($selectedItems).includes(item.id)}
        >
            {item.title}
        </div>
    {/each}
</section>

<style>
    div {
        height: 1.5em;
        width: 10em;
        text-align: center;
        border: 1px solid black;
        margin: 0.2em;
        padding: 0.3em;
    }
    section {
        min-height: 12em;
    }
    .selected {
        border-color: blue;
        opacity: 0.6;
    }
    :global([data-selected-items-count]::after) {
        position: absolute;
        right: 0.2em;
        padding: 0.1em;
        content: attr(data-selected-items-count);
        color: white;
        background: rgba(0, 0, 0, 0.6);
    }
</style>
