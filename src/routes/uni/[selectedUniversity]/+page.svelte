<script lang="ts">
    import { page } from '$app/stores';
    import Leaderboard from '../../../components/Leaderboard.svelte';
    
    // Fix the parameter name to match the file path
    const university = $page.params.selectedUniversity;
    
</script>
<svelte:head>
    <title>{university} Leaderboard</title>
</svelte:head>
<Leaderboard university={university}/>
