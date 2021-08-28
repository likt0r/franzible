<template>
	<v-app dark>
		<messages />

		<transition name="fade">
			<app-bar :hide-bar="!isSingleBookPage"> </app-bar>
		</transition>
		<app-side-menu></app-side-menu>
		<v-main>
			<transition name="fade">
				<offline-hint v-if="showOfflineHint"></offline-hint>
				<nuxt v-else />
			</transition>
		</v-main>
		<transition name="fade">
			<v-btn
				v-if="isSingleBookPage"
				class="mt-4 ml-2"
				mid
				fab
				color="#13202a"
				fixed
				to="/"
			>
				<v-icon dark> mdi-arrow-left </v-icon>
			</v-btn>
		</transition>
		<v-navigation-drawer
			v-if="isSingleBookPage"
			v-model="fileListState"
			color="#13202a"
			right
			app
			:width="425"
			fixed
		>
			<playlist />
			<template #append>
				<div class="pa-2">
					<v-btn block @click.stop="fileListState = !fileListState">
						Schließen
					</v-btn>
				</div>
			</template>
		</v-navigation-drawer>
		<small-player v-if="!isSingleBookPage" />
	</v-app>
</template>

<script>
import Playlist from '~/components/Playlist.vue'
import SmallPlayer from '~/components/SmallPlayer.vue'
import AppBar from '~/components/AppBar.vue'
import AppSideMenu from '~/components/AppSideMenu.vue'
import Messages from '~/components/Messages.vue'
import OfflineHint from '~/components/OfflineHint.vue'
import { OFFLINE_PAGES } from '~/tools/consts'
export default {
	components: {
		Playlist,
		SmallPlayer,
		AppBar,
		AppSideMenu,
		Messages,
		OfflineHint,
	},

	data() {
		return {
			drawer: false,
			fixed: false,
			miniVariant: false,
			right: true,
		}
	},
	computed: {
		fileListState: {
			get() {
				return this.$store.state.fileListState
			},
			set(value) {
				this.$store.commit('SET_FILE_LIST', value)
			},
		},
		isSingleBookPage() {
			return this.$nuxt.$route.name.startsWith('books-id')
		},
		showOfflineHint() {
			return (
				!OFFLINE_PAGES.includes(this.$nuxt.$route.name) &&
				!this.$store.getters['connection/connected']
			)
		},
	},
	methods: {},
}
</script>
<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
	transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out;
}
.slide-left-enter {
	opacity: 0;
	transform: translate3d(50vw, 0px, 0);
}
.slide-left-leave-to {
	opacity: 0;
	transform: translate3d(-50vw, 0px, 0);
}

.slide-right-enter-active,
.slide-right-leave-active {
	transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out;
}
.slide-right-enter {
	opacity: 0;
	transform: translate3d(-50vw, 0px, 0);
}
.slide-right-leave-to {
	opacity: 0;
	transform: translate3d(50vw, 0px, 0);
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.25s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
</style>
