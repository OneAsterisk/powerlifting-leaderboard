<script lang="ts">
</script>

<footer class="footer">
	<div class="footer-content">
		<p class="footer-text">&copy; Created by Ben Papp. Est. 2024</p>
	</div>
</footer>

<style>
	.footer {
		background-color: #212529;
		border-top: 1px solid #333;
		margin-top: auto;
		width: 100%;
		padding: 1.5rem 1rem;
		box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.footer-text {
		color: #b3b3b3;
		font-size: 0.95rem;
		font-weight: 400;
		margin: 0;
		text-align: center;
		letter-spacing: 0.5px;
	}

	/* Mobile Responsive Styles */
	@media (max-width: 768px) {
		.footer {
			padding: 1.25rem 0.75rem;
		}

		.footer-text {
			font-size: 0.9rem;
		}
	}

	@media (max-width: 576px) {
		.footer {
			padding: 1rem 0.5rem;
		}

		.footer-text {
			font-size: 0.85rem;
		}
	}

	@media (max-width: 400px) {
		.footer {
			padding: 0.875rem 0.25rem;
		}

		.footer-text {
			font-size: 0.8rem;
			letter-spacing: 0.25px;
		}
	}
</style>
