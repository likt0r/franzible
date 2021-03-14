<template>
  <v-navigation-drawer
    v-model="showNavigationDrawer"
    fixed
    app
    temporary
    style="background-color: #13202a"
  >
    <v-list>
      <v-img contain style="background-color: #000" src="/logo.png"></v-img>
      <v-list-item
        v-for="item in menu"
        :key="item.title"
        router
        exact
        :to="item.to"
        @click="item.click && item.click()"
      >
        <v-list-item-action>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title v-text="item.title" />
        </v-list-item-content>
      </v-list-item>

      <fragment v-if="userIsAdmin">
        <v-divider></v-divider>
        <v-list-item
          v-for="item in adminMenu"
          :key="item.title"
          router
          exact
          :to="item.to"
          @click="item.click && item.click()"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </fragment>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { Fragment } from 'vue-fragment'
export default {
  components: { Fragment },
  data() {
    return {
      menu: [
        {
          icon: 'mdi-account-outline',
          title: 'Account',
          to: '/account',
        },
        {
          icon: 'mdi-book-open-page-variant-outline',
          title: 'Libary',
          to: '/',
        },
        {
          icon: 'mdi-exit-to-app',
          title: 'Logout',
          click: this.logout,
        },
      ],
      adminMenu: [
        {
          icon: 'mdi-account-details-outline',
          title: 'Users',
          to: '/admin/users',
        },
      ],
    }
  },
  computed: {
    userIsAdmin() {
      return this.$store.state.auth.user && this.$store.state.auth.user.isAdmin
    },
    showNavigationDrawer: {
      get() {
        return this.$store.getters.getShowNavigationDrawer
      },
      set(val) {
        this.$store.dispatch('setShowNavigationDrawer', val)
      },
    },
  },
  methods: {
    noOp() {},
    async logout() {
      console.log('logout')
      await this.$store.dispatch('auth/logout')
      location.reload()
    },
  },
}
</script>

<style></style>
