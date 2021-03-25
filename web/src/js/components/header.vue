<template>
<header id="pubHeader">
    <div class="header-inner">
        <nav>
            <ul>
                <li><a href="./">{{$t('header.home')}}</a></li>
                <li><a href="./feedback.html">{{$t('header.contact')}}</a></li>
                <li class="nav-button-container"><button class="btn btn-primary" @click="submit" :disabled="isLoading">{{$t('header.create')}}</button></li>
            </ul>
        </nav>
    </div>
</header>
</template>

<script>
export default {
    data() {
        return {}
    }
}
</script>