<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <v-card class="elevation-12" style="background-color: #000">
          <v-img
            height="250"
            style="background-color: #000"
            contain
            src="/logo.png"
          ></v-img>

          <v-card-text>
            <v-form>
              <v-text-field
                v-model="loginData.email"
                prepend-icon="mdi-account"
                name="email"
                label="Email"
                type="email"
              ></v-text-field>
              <v-text-field
                v-model="loginData.password"
                prepend-icon="mdi-lock"
                name="password"
                label="Password"
                type="password"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" :loading="authenticating" @click="login"
              >Login</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  layout: 'full',
  data() {
    return {
      loginData: {
        strategy: 'local',
        email: '',
        password: '',
      },
      authenticating: false,
    }
  },
  methods: {
    async login() {
      console.log('loginData', this.loginData)
      this.authenticating = true
      try {
        await this.$store.dispatch('auth/authenticate', this.loginData)
        this.authenticating = false
        this.$router.push('/')
      } catch (error) {
        this.authenticating = false
        console.log('Error', error)
        this.$toast.error('Unbekannte Email oder Password', {
          icon: 'alert-circle-outline',
        })
      }
    },
  },
}
</script>

<style></style>
