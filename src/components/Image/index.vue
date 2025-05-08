<template>
  <div>
    <div class="img-uploader" @click="uploadFile" v-if="!image">
      <q-icon name="add" size="40px" color="grey-5" />
    </div>
    <div class="img-box" v-else>
      <img :src="image" @click="uploadFile" />
      <div class="operation">
        <q-icon class="icon" name="edit" @click="uploadFile" />
        <q-icon class="icon" name="delete" @click="delImage" />
      </div>
    </div>
  </div>
</template>


<script setup>
import getFile from "@/utils/file.js";
import IndexApi from "@/api/index.js";

const image = defineModel({ type: String, default: "" });

const uploadFile = async () => {
  getFile({ limit: 10, fileType: "image/*" }).then(async (res) => {
    console.log("res", res);
    let formData = new FormData();
    formData.append("type", "image");
    formData.append("file", res);
    let { data } = await IndexApi.uploadFile(formData);
    image.value = data.url;
  });
};

const delImage = () => {
  image.value = "";
};
</script>


<style lang="scss" scoped>
.img-uploader {
  width: 120px;
  height: 120px;
  border: 1px dashed #dbe2ea;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  cursor: pointer;
}

.img-box {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  img {
    width: 120px;
    height: 120px;
  }
  .operation {
    height: 28px;
    padding: 0 12px;
    background: #0000006b;
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: center;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    .icon {
      cursor: pointer;
      font-size: 18px;
      color: white;
    }
  }
}
</style>