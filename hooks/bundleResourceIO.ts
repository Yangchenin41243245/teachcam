import * as tf from '@tensorflow/tfjs';
import { Asset } from 'expo-asset';

export function bundleResourceIO(
  modelJson: any,
  modelWeightsId: number | number[]
): tf.io.IOHandler {
  const weightsIds = Array.isArray(modelWeightsId)
    ? modelWeightsId
    : [modelWeightsId];

  return {
    load: async (): Promise<tf.io.ModelArtifacts> => {
      const weightBuffers: ArrayBuffer[] = await Promise.all(
        weightsIds.map(async (id) => {
          const [asset] = await Asset.loadAsync(id);
          // 直接 fetch localUri，回傳 ArrayBuffer，不需要任何 FileSystem API
          const response = await fetch(asset.localUri!);
          return await response.arrayBuffer();
        })
      );

      // 合併所有 buffer
      const totalBytes = weightBuffers.reduce((s, b) => s + b.byteLength, 0);
      const merged = new ArrayBuffer(totalBytes);
      const mergedView = new Uint8Array(merged);
      let offset = 0;
      for (const buf of weightBuffers) {
        mergedView.set(new Uint8Array(buf), offset);
        offset += buf.byteLength;
      }

      const weightsManifest: any[] = modelJson.weightsManifest ?? [];
      const weightSpecs: tf.io.WeightsManifestEntry[] = weightsManifest.flatMap(
        (group: any) => group.weights as tf.io.WeightsManifestEntry[]
      );

      return {
        modelTopology: modelJson.modelTopology,
        weightSpecs,
        weightData: merged,
        format: modelJson.format,
        generatedBy: modelJson.generatedBy,
        convertedBy: modelJson.convertedBy,
      };
    },
  };
}