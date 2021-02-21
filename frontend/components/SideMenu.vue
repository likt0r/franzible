<template>
  <v-list>
    <v-list-item
      v-for="(item, i) in items"
      :key="i"
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
  </v-list>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          icon: 'mdi-book-open-page-variant-outline',
          title: 'Libary',
          to: '/',
        },
        {
          icon: 'mdi-account-details-outline',
          title: 'Users',
          to: '/users/',
        },
        {
          icon: 'mdi-exit-to-app',
          title: 'Logout',
          click: this.logout,
        },
      ],
    }
  },
  methods: {
    noOp() {},
    async logout() {
      console.log('logout')
      await this.$store.dispatch('auth/logout')
      this.$router.push('/login')
    },
  },
}
</script>

<style></style>
