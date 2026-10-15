package com.quizmaster;

import java.util.List;

/**
 * Smart Quiz Performance Predictor - Java Backend Helper
 * Calculates linear regression trend prediction for quiz scores.
 */
public class QuizPredictor {

    public static double predictNextScore(List<Integer> pastScores) {
        if (pastScores == null || pastScores.isEmpty()) {
            return 0.0;
        }
        int n = pastScores.size();
        if (n == 1) {
            return pastScores.get(0);
        }

        double sumX = 0;
        double sumY = 0;
        double sumXY = 0;
        double sumXX = 0;

        for (int i = 0; i < n; i++) {
            double x = i;
            double y = pastScores.get(i);
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        }

        double slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        double intercept = (sumY - slope * sumX) / n;

        double predicted = slope * n + intercept;
        return Math.max(0.0, Math.min(100.0, predicted));
    }

    public static void main(String[] args) {
        List<Integer> sampleScores = List.of(65, 70, 75, 82);
        double prediction = predictNextScore(sampleScores);
        System.out.println("Predicted Next Score: " + Math.round(prediction) + "%");
    }
}
