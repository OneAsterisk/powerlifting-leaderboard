<script>
    import { db } from '$lib/firebase';
    import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
    import { onDestroy } from 'svelte';
  
    /**
	 * @type {any[]}
	 */
    let lifts = [];
  
    const q = query(
      collection(db, 'lifts'),
      orderBy('total', 'desc'),
      limit(10)
    );
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      lifts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          formattedDate: formatDate(data.timestamp),
        };
      });
    });
  
    onDestroy(() => {
      unsubscribe();
    });
  
    /**
	 * @param {{ toDate: () => any; }} timestamp
	 */
    function formatDate(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate();
      console.log(date);
      return date.toLocaleDateString();
    }
  </script>
  
  <h2>Top 10 Lifts</h2>
  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>Squat</th>
        <th>Bench</th>
        <th>Deadlift</th>
        <th>Total</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      {#each lifts as lift, index}
        <tr>
          <td>{index + 1}</td>
          <td>{lift.displayName}</td>
          <td>{lift.squat}</td>
          <td>{lift.bench}</td>
          <td>{lift.deadlift}</td>
          <td>{lift.total}</td>
          <td>{lift.formattedDate}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  