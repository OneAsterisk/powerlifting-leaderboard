<script>
	import Leaderboard from '../components/Leaderboard.svelte';
	import { Theme } from '@sveltestrap/sveltestrap';

	const title = 'Collegiate Strength - University Powerlifting Leaderboard & Rankings';
	const description =
		'The premier powerlifting leaderboard for college and university athletes. Compare squat, bench press, and deadlift records across universities. Track your DOTS score and compete with collegiate powerlifters nationwide.';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta
		name="keywords"
		content="powerlifting leaderboard, collegiate powerlifting, university powerlifting rankings, college strength sports, squat bench deadlift records, DOTS score calculator, student athletes powerlifting, campus recreation powerlifting, university gym records, college powerlifting competition, strength athletics rankings, powerlifting database, collegiate strength training, university athletics powerlifting, college fitness leaderboard"
	/>

	<!-- Open Graph -->
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://collegiatestrength.org" />

	<!-- Twitter -->
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />

	<!-- Structured Data for Homepage -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SportsOrganization",
			"name": "Collegiate Strength",
			"description": "University powerlifting leaderboard and ranking platform for collegiate athletes",
			"url": "https://collegiatestrength.org",
			"sameAs": ["https://collegiatestrength.org"],
			"sport": "Powerlifting",
			"audience": {
				"@type": "Audience",
				"audienceType": "College Students, University Athletes, Powerlifters, Strength Athletes"
			},
			"offers": {
				"@type": "Offer",
				"description": "Free powerlifting leaderboard and ranking system",
				"price": "0",
				"priceCurrency": "USD"
			},
			"hasOfferCatalog": {
				"@type": "OfferCatalog",
				"name": "Powerlifting Services",
				"itemListElement": [
					{
						"@type": "Offer",
						"itemOffered": {
							"@type": "Service",
							"name": "Powerlifting Leaderboard",
							"description": "Track and compare powerlifting records across universities"
						}
					},
					{
						"@type": "Offer",
						"itemOffered": {
							"@type": "Service",
							"name": "DOTS Score Calculator",
							"description": "Calculate and compare DOTS scores for fair competition"
						}
					},
					{
						"@type": "Offer",
						"itemOffered": {
							"@type": "Service",
							"name": "University Rankings",
							"description": "View powerlifting rankings by university and college"
						}
					}
				]
			}
		}
	</script>
</svelte:head>

<!-- SEO Content Section -->
<div
	class="seo-content"
	style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;"
>
	<h1>Collegiate Strength - University Powerlifting Leaderboard</h1>
	<h2>Track Your Powerlifting Records Across Universities</h2>
	<p>
		Welcome to Collegiate Strength, the premier powerlifting leaderboard platform for college and
		university athletes. Our comprehensive ranking system allows students to track their squat,
		bench press, and deadlift records while competing with powerlifters from universities
		nationwide.
	</p>

	<h3>Features for Collegiate Powerlifters:</h3>
	<ul>
		<li>University powerlifting leaderboards and rankings</li>
		<li>DOTS score calculation for fair competition across weight classes</li>
		<li>Individual lift tracking (squat, bench press, deadlift)</li>
		<li>College and university comparison tools</li>
		<li>Student athlete performance metrics</li>
		<li>Campus recreation powerlifting integration</li>
	</ul>

	<h3>Powerlifting Competition Categories:</h3>
	<ul>
		<li>Raw powerlifting competitions</li>
		<li>Equipped powerlifting meets</li>
		<li>Collegiate powerlifting championships</li>
		<li>University strength competitions</li>
		<li>Campus powerlifting events</li>
		<li>Student recreation tournaments</li>
	</ul>

	<h3>Strength Sports Disciplines:</h3>
	<ul>
		<li>Powerlifting (squat, bench press, deadlift)</li>
		<li>Strength athletics and iron sports</li>
		<li>Barbell sports and lifting platforms</li>
		<li>University gym and fitness center integration</li>
		<li>Collegiate strength and conditioning</li>
		<li>Student athlete development programs</li>
	</ul>

	<p>
		Join thousands of collegiate powerlifters who trust Collegiate Strength to track their progress,
		compare their lifts, and compete with fellow university athletes. Whether you're a beginner
		looking to start your powerlifting journey or an experienced lifter aiming for collegiate
		records, our platform provides the tools you need to succeed in strength sports.
	</p>
</div>

<Theme theme="dark">
	<Leaderboard university={undefined} />
</Theme>
