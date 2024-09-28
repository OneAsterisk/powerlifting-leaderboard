<script>
    import { user } from '../stores/userStore';
    import { db } from '$lib/firebase';
    import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
  
    let squat = 0;
    let bench = 0;
    let deadlift = 0;
  
    const submitLifts = async () => {
      if ($user) {
        try {
          await addDoc(collection(db, 'lifts'), {
            userId: $user.uid,
            displayName: $user.displayName,
            squat,
            bench,
            deadlift,
            total: squat + bench + deadlift,
            timestamp: serverTimestamp(),
          });
          alert('Submission successful!');
        } catch (error) {
          console.error('Error submitting lifts:', error);
        }
      } else {
        alert('Please sign in to submit your lifts.');
      }
    };
  </script>
  
  {#if $user}
    <form on:submit|preventDefault={submitLifts}>
      <label>
        Squat:
        <input type="number" bind:value={squat} min="0" required />
      </label>
      <label>
        Bench:
        <input type="number" bind:value={bench} min="0" required />
      </label>
      <label>
        Deadlift:
        <input type="number" bind:value={deadlift} min="0" required />
      </label>
      <button type="submit">Submit</button>
    </form>
  {:else}
    <p>Please sign in to submit your lifts.</p>
  {/if}