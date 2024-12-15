import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let handLandmarker;
const video = document.createElement("video");

async function initializeHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks("/path/to/wasm/files");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: "/path/to/hand_landmarker.task" },
        runningMode: "VIDEO",
        numHands: 2
    });

    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
    video.play();
}

async function getFingerPosition(args) {
    const hands = await handLandmarker.detectForVideo(video, Date.now());
    if (hands.length > 0) {
        const hand = hands[0];
        const landmarks = hand.landmarks;

        const fingerIndex = {
            thumb: 4,
            index: 8,
            middle: 12,
            ring: 16,
            pinky: 20
        }[args.FINGER];

        const coord = args.COORD;
        return landmarks[fingerIndex][coord];
    }
    return 0;
}

async function getFingerDistance(args) {
    const hands = await handLandmarker.detectForVideo(video, Date.now());
    if (hands.length > 0) {
        const hand = hands[0];
        const landmarks = hand.landmarks;

        const finger1Index = {
            thumb: 4,
            index: 8,
            middle: 12,
            ring: 16,
            pinky: 20
        }[args.FINGER1];

        const finger2Index = {
            thumb: 4,
            index: 8,
            middle: 12,
            ring: 16,
            pinky: 20
        }[args.FINGER2];

        const point1 = landmarks[finger1Index];
        const point2 = landmarks[finger2Index];

        return Math.sqrt(
            Math.pow(point1.x - point2.x, 2) +
            Math.pow(point1.y - point2.y, 2) +
            Math.pow(point1.z - point2.z, 2)
        );
    }
    return 0;
}

export default {
    init: initializeHandLandmarker,
    blocks: {
        getFingerPosition: { operation: getFingerPosition },
        getFingerDistance: { operation: getFingerDistance }
    }
};