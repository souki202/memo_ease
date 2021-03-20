function _getHistories() {
    const histories = localStorage.getItem('memoHistories');
    if (!histories) {
        return {}
    }

    const parsed = JSON.parse(histories);
    if (!parsed) {
        return {}
    }
    return parsed;
}

export let getHistories = _getHistories;

export let updateHistory = (memoUuid, memoAlias, title) => {
    const histories = _getHistories();
    
    const now = (new Date()).getTime();
    histories[memoUuid] = {
        memoAlias: memoAlias,
        title: title,
        date: now,
    }

    localStorage.setItem('memoHistories', JSON.stringify(histories));
}