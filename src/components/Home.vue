<template>
    <MainLayout>
        <div>
            <h1>Welcome to the Home Page</h1>
            <p>This is a simple home component.</p>
        </div>
    </MainLayout>
</template>
<script>
import MainLayout from '../layouts/MainLayout.vue'
export default {
  name: 'HomeComponent',
  components: {
    MainLayout
  }
}
</script>
<style scoped>
h1 {
font-size: 24px;
margin-bottom: 10px;
}

p {
font-size: 16px;
color: #888;
}
</style>
