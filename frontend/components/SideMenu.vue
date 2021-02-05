<template>
  <v-list>
    <v-list-item
      v-for="(item, i) in items"
      :key="i"
      router
      exact
      @click="item.click || noOp"
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
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/',
        },
        {
          icon: 'mdi-exit-to-app',
          title: 'Logout',
          click: this.logout,
          to: '/',
        },
      ],
    }
  },
  methods: {
    noOp() {},
    async logout() {
      await this.$store.dispatch('auth/logout')
      this.$router.push('/login')
    },
  },
}
</script>

<style></style>
