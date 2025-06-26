<script lang="ts">
</script>

<footer class="footer">
	<div class="footer-content">
		<p class="footer-text">&copy; Created by Ben Papp. Est. 2024</p>
	</div>
</footer>

<style>
	.footer {
		background: linear-gradient(135deg, #212529 0%, #1a1e21 100%);
		border-top: 2px solid #0761c7;
		margin-top: auto;
		width: 100%;
		padding: 2rem 1rem;
		box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.25);
		position: relative;
	}

	.footer::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent 0%, #4fc3f7 50%, transparent 100%);
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
	}

	.footer-text {
		color: #e0e0e0;
		font-size: 1rem;
		font-weight: 500;
		margin: 0;
		text-align: center;
		letter-spacing: 0.75px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		position: relative;
	}

	/* Mobile Responsive Styles */
	@media (max-width: 768px) {
		.footer {
			padding: 1.75rem 0.75rem;
		}

		.footer-text {
			font-size: 0.95rem;
			letter-spacing: 0.5px;
		}
	}

	@media (max-width: 576px) {
		.footer {
			padding: 1.5rem 0.5rem;
		}

		.footer-text {
			font-size: 0.9rem;
			letter-spacing: 0.5px;
		}
	}

	@media (max-width: 400px) {
		.footer {
			padding: 1.25rem 0.25rem;
		}

		.footer-text {
			font-size: 0.85rem;
			letter-spacing: 0.25px;
		}
	}

	/* Large screen enhancements */
	@media (min-width: 1200px) {
		.footer {
			padding: 2.5rem 1.5rem;
		}

		.footer-text {
			font-size: 1.05rem;
		}
	}
</style>
