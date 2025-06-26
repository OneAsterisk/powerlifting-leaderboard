<svelte:head>
	<title>Collegiate Strength - FAQ</title>
</svelte:head>

<div class="faq-container">
	<header class="faq-header">
		<h1>Frequently Asked Questions</h1>
		<p class="faq-subtitle">Everything you need to know about Collegiate Strength</p>
	</header>

	<main class="faq-content">
		<article class="faq-article">
			<section class="faq-section">
				<h2 class="faq-question">What is Collegiate Strength?</h2>
				<div class="faq-answer">
					<p>
						Collegiate Strength is a platform for collegiate powerlifters to submit their best lifts
						and compare them with other lifters across the country. Our goal is to provide a fun and
						competitive environment for collegiate lifters to showcase their strength and connect
						with other lifters.
					</p>
				</div>
			</section>

			<section class="faq-section">
				<h2 class="faq-question">How can I submit my lifts?</h2>
				<div class="faq-answer">
					<p>
						To submit your lifts simply sign in with a google account and go to the Submit Lifts
						page. In there you can enter all your numbers, age, gender, university, and weight.
					</p>
				</div>
			</section>

			<section class="faq-section">
				<h2 class="faq-question">What lift gets displayed on the leaderboard?</h2>
				<div class="faq-answer">
					<p>
						Your lift with the highest total gets displayed and ranked on the global leaderboard!
					</p>
				</div>
			</section>

			<section class="faq-section">
				<h2 class="faq-question">Why use Collegiate Strength?</h2>
				<div class="faq-answer">
					<p>
						Collegiate strength allows you to submit your own lifts without having to compete to see
						how you rank among many other collegiate level lifters. This allows you to keep your
						highest total up to date without having to wait to compete or for results to come out
						from your meet.
					</p>
				</div>
			</section>

			<section class="faq-section">
				<h2 class="faq-question">Why is my dots different than what was at the meet?</h2>
				<div class="faq-answer">
					<p>
						Our dots calculation does take into account age. If you feel there is an issue, please
						email us at <a href="mailto:support@collegiatestrength.org" class="support-link"
							>support@collegiatestrength.org</a
						>
					</p>
				</div>
			</section>
		</article>
	</main>
</div>

<style>
	/* Container and Layout */
	.faq-container {
		max-width: 900px;
		margin: 0 auto;
		width: 100%;
		padding: 0 1rem;
	}

	.faq-header {
		text-align: center;
		margin-bottom: 3rem;
		padding: 2rem 0;
		border-bottom: 2px solid rgba(79, 195, 247, 0.3);
	}

	.faq-header h1 {
		color: #4fc3f7;
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 1rem;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.faq-subtitle {
		color: #b3b3b3;
		font-size: 1.2rem;
		font-weight: 400;
		margin: 0;
	}

	.faq-content {
		padding-bottom: 2rem;
	}

	.faq-article {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* FAQ Section Styles */
	.faq-section {
		background-color: rgba(255, 255, 255, 0.03);
		border-radius: 12px;
		padding: 2rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.faq-section:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
		border-color: rgba(79, 195, 247, 0.3);
	}

	.faq-question {
		color: #4fc3f7;
		font-size: 1.4rem;
		font-weight: 600;
		margin-bottom: 1.25rem;
		line-height: 1.4;
		border-bottom: 2px solid rgba(79, 195, 247, 0.2);
		padding-bottom: 0.75rem;
	}

	.faq-answer {
		color: #ffffff;
		line-height: 1.7;
	}

	.faq-answer p {
		font-size: 1.05rem;
		margin: 0;
		text-align: justify;
	}

	/* Link Styles */
	.support-link {
		color: #4fc3f7;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s ease;
		border-bottom: 1px solid transparent;
	}

	.support-link:hover {
		color: #29b6f6;
		border-bottom-color: #29b6f6;
		text-decoration: none;
	}

	/* Mobile Responsive Styles */
	@media (max-width: 992px) {
		.faq-container {
			padding: 0 0.75rem;
		}

		.faq-header {
			margin-bottom: 2.5rem;
			padding: 1.5rem 0;
		}

		.faq-header h1 {
			font-size: 2.25rem;
		}

		.faq-subtitle {
			font-size: 1.1rem;
		}

		.faq-section {
			padding: 1.75rem;
		}

		.faq-question {
			font-size: 1.3rem;
			margin-bottom: 1rem;
		}

		.faq-answer p {
			font-size: 1rem;
		}
	}

	@media (max-width: 768px) {
		.faq-container {
			padding: 0 0.5rem;
		}

		.faq-header {
			margin-bottom: 2rem;
			padding: 1.25rem 0;
		}

		.faq-header h1 {
			font-size: 2rem;
		}

		.faq-subtitle {
			font-size: 1rem;
		}

		.faq-article {
			gap: 1.5rem;
		}

		.faq-section {
			padding: 1.5rem;
			border-radius: 8px;
		}

		.faq-question {
			font-size: 1.2rem;
			margin-bottom: 0.875rem;
			padding-bottom: 0.5rem;
		}

		.faq-answer p {
			font-size: 0.95rem;
			text-align: left;
			line-height: 1.6;
		}
	}

	@media (max-width: 576px) {
		.faq-container {
			padding: 0 0.25rem;
		}

		.faq-header {
			margin-bottom: 1.5rem;
			padding: 1rem 0;
		}

		.faq-header h1 {
			font-size: 1.75rem;
			margin-bottom: 0.75rem;
		}

		.faq-subtitle {
			font-size: 0.95rem;
		}

		.faq-article {
			gap: 1.25rem;
		}

		.faq-section {
			padding: 1.25rem;
		}

		.faq-question {
			font-size: 1.1rem;
			margin-bottom: 0.75rem;
			line-height: 1.3;
		}

		.faq-answer p {
			font-size: 0.9rem;
			line-height: 1.5;
		}
	}

	@media (max-width: 400px) {
		.faq-header h1 {
			font-size: 1.5rem;
		}

		.faq-section {
			padding: 1rem;
		}

		.faq-question {
			font-size: 1rem;
		}

		.faq-answer p {
			font-size: 0.85rem;
		}
	}

	/* Accessibility and Touch Improvements */
	@media (max-width: 768px) {
		.support-link {
			min-height: 44px;
			display: inline-block;
			line-height: 1.5;
		}
	}

	/* Smooth scrolling for better UX */
	@media (prefers-reduced-motion: no-preference) {
		html {
			scroll-behavior: smooth;
		}
	}
</style>
