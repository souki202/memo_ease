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
import { getApiUrl, rootPageUrl } from '../url';

export default {
    data() {
        return {
            isLoading: false,
        };
    },
    methods: {
        submit() {
            this.isLoading = true;
            axios.post(getApiUrl() + '/create_memo')
                .then(res => {
                    if (res.data.memo_uuid) {
                        location.href = rootPageUrl + '/edit.html?memo_uuid=' + res.data.memo_uuid;
                    }
                }).catch(err => {
                    window.alert(this.$t('messages.createError'));
                    console.log(err);
                }).then(() => {
                    this.isLoading = false;
                });
        },
    }
}
</script>