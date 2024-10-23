<script lang="ts">
    import { page } from '$app/stores';
    
    // Access the dynamic parameter
    const displayName = $page.params.displayName;
    
    // Here you can fetch user data based on the displayName
</script>

<svelte:head>
    <title>Profile: {displayName}</title>
</svelte:head>

<h1>Profile: {displayName}</h1>