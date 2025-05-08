<template>
  <div class="sort-detail-page">
    <!-- 顶部栏 -->
    <div class="header-bar">
      <div class="left">
        <span class="wave-no">WN3HB00039</span>
        <span class="wave-type">（多品混包）</span>
      </div>
      <div class="right">
        <span class="progress">处理进度:0/3</span>
        <q-btn color="negative" flat class="end-btn" label="结束作业" />
        <q-btn color="primary" outline icon="history" label="分拣记录" />
      </div>
    </div>

    <!-- 主体卡片 -->
    <div class="main-card">
      <!-- 商品标签输入 -->
      <div class="input-row">
        <q-input
          outlined
          class="tag-input"
          v-model="pageData.keyword"
          label="请扫描商品标签"
          @keyup.enter="search"
        />
      </div>
      <div class="input-tip">
        <q-icon name="info" size="16px" color="grey-7" />
        <span>请先切换或[EN]输入法</span>
      </div>

      <!-- 分拣信息 -->
      <div class="sort-info-title">分拣信息</div>
      <div class="sort-info-row">
        <div class="product-img-placeholder"></div>
        <div class="sort-boxes">
          <div class="sort-box">1</div>
          <div class="sort-box">2</div>
          <div class="sort-box">3</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const pageData = reactive({
  keyword: "",
  waveInfo: {},
});

const search = async () => {
  console.log("search", pageData.keyword);
};
</script>

<style scoped lang="scss">
.sort-detail-page {
  background: #f5f6fa;
  min-height: 100vh;
  padding: 0;
  position: relative;

  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 40px 0 40px;
    height: 50px;
    font-size: 16px;
    font-weight: 500;
    background: #fff;

    .left {
      .wave-no {
        font-size: 20px;
        font-weight: bold;
        margin-right: 8px;
      }
      .wave-type {
        color: #888;
      }
    }

    .right {
      display: flex;
      align-items: center;
      gap: 24px;

      .user-info {
        color: #888;
      }
      .progress {
        color: #1976d2;
      }
      .end-btn {
        margin-left: 12px;
      }
    }
  }

  .side-record {
    position: absolute;
    top: 32px;
    right: 40px;
    z-index: 2;
  }

  .main-card {
    background: #fff;
    border-radius: 8px;
    margin: 32px 40px 0 40px;
    padding: 32px 32px 40px 32px;
    min-height: 400px;
    position: relative;

    .input-row {
      margin-bottom: 8px;
      display: flex;
      gap: 12px;

      .tag-input {
        width: 100%;
      }
    }

    .input-tip {
      color: #888;
      font-size: 13px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sort-info-title {
      font-weight: bold;
      margin-bottom: 16px;
      margin-top: 16px;
    }

    .sort-info-row {
      display: flex;
      align-items: flex-start;
      gap: 32px;

      .product-img-placeholder {
        width: 180px;
        height: 180px;
        background: #0076ff;
        border-radius: 4px;
        flex-shrink: 0;
      }

      .sort-boxes {
        display: flex;
        gap: 0;

        .sort-box {
          width: 180px;
          height: 80px;
          border: 1px solid #dbe2ea;
          display: flex;
          align-items: center;
          padding: 0 20px;
          font-size: 20px;
          background: #fff;
          font-weight: 500;
        }
      }
    }
  }
}
</style>