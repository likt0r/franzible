<template>
	<section color="black">
		<v-list ref="books" subheader two-line color="black">
			<transition-group name="list">
				<book-list-entry v-for="book in books" :key="book._id" :book="book">
				</book-list-entry>
			</transition-group>
		</v-list>

		<v-skeleton-loader
			v-if="requestPending"
			:type="sekletonString"
		></v-skeleton-loader>
		<div class="spacer"></div>
	</section>
</template>

<script>
import { mapActions } from 'vuex'
import BookListEntry from '~/components/BookListEntry.vue'
import OfflineHint from '~/components/OfflineHint.vue'
export default {
	components: { BookListEntry, OfflineHint },
	mixins: [],
	layout: 'default',
	transition: 'slide-right',
	data() {
		return {
			sekletonString: [...Array(3).keys()]
				.map(() => {
					return 'list-item-avatar-two-line'
				})
				.join(','),
		}
	},
	computed: {
		booksParams() {
			return { query: {} } // Step 3
		},
		requestPending() {
			return this.$store.getters.getRequestPending
		},
		books() {
			return this.$store.getters.getSearchResult
		},
		scrollPosition() {
			return this.$store.getters.getSearchScrollPosition
		},
	},

	mounted() {
		// init endless scroll listener

		this.$nextTick(function () {
			window.addEventListener('scroll', this.onScroll, {
				passive: true,
			})
			if (this.books.length === 0) {
				this.requestSearchApi() // needed for initial loading on page
			}
		})
		requestAnimationFrame(() => {
			window.scrollTo(0, this.scrollPosition)
		}, 1000)
		console.log('mounted')
	},
	beforeDestroy() {
		window.removeEventListener('scroll', this.onScroll)
	},
	methods: {
		...mapActions(['requestSearchApi', 'setSearchScrollPosition']),
		onScroll() {
			console.log('onScroll')
			const { scrollTop, scrollHeight, clientHeight } =
				document.documentElement
			this.setSearchScrollPosition(scrollTop)
			if (scrollTop + clientHeight >= scrollHeight - 5) {
				if (this.$store.getters['connection/connected']) {
					console.log('onscroll request search api')
					this.requestSearchApi()
				}
			}
		},
	},
}
</script>
<style scoped>
.theme--dark.v-application {
	background-color: black !important;
}
.v-skeleton-loader__list-item-avatar-two-line {
	background-color: black !important;
}
.v-skeleton-loader__avatar {
	border-radius: unset !important;
}

.list-enter-active {
	transition: all 1s;
}
.list-enter/* .list-leave-active below version 2.1.8 */ {
	opacity: 0;
	transform: translateY(-30px);
}
.spacer {
	height: 72px;
}
</style>
