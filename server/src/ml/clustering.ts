import { StudentFeatureVector } from './types.js';

export interface ClusterSummary {
  clusterId: number;
  name: string;
  count: number;
  avgCgpa: number;
  avgCoding: number;
  avgAptitude: number;
  avgComm: number;
  placementRate: number;
  description: string;
}

export class StudentClusteringEngine {
  k: number = 6;
  centroids: number[][] = [];
  clusterNames: string[] = [
    'Placement Ready',
    'Nearly Ready',
    'Needs Technical Improvement',
    'Needs Aptitude Improvement',
    'Needs Communication Improvement',
    'High Intervention Need'
  ];

  private extractVector(s: StudentFeatureVector): number[] {
    return [
      s.cgpa / 10,
      s.coding_score / 100,
      s.aptitude_score / 100,
      s.communication_score / 100,
      s.internship_status,
      Math.min(s.number_of_projects / 5, 1)
    ];
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, idx) => sum + Math.pow(val - (b[idx] || 0), 2), 0));
  }

  fit(data: StudentFeatureVector[]): ClusterSummary[] {
    if (data.length === 0) return [];

    const vectors = data.map(d => this.extractVector(d));
    const dims = vectors[0].length;

    // Initialize centroids using k-means++ logic
    this.centroids = [];
    this.centroids.push([...vectors[Math.floor(Math.random() * vectors.length)]]);

    while (this.centroids.length < this.k) {
      const dists = vectors.map(v => Math.min(...this.centroids.map(c => this.euclideanDistance(v, c))));
      const sumDists = dists.reduce((a, b) => a + b, 0);
      let rand = Math.random() * sumDists;
      let nextIdx = 0;
      for (let i = 0; i < dists.length; i++) {
        rand -= dists[i];
        if (rand <= 0) {
          nextIdx = i;
          break;
        }
      }
      this.centroids.push([...vectors[nextIdx]]);
    }

    // Iterative clustering updates
    let assignments = new Array(vectors.length).fill(0);
    for (let iter = 0; iter < 15; iter++) {
      // Assign points to nearest centroid
      for (let i = 0; i < vectors.length; i++) {
        let minDist = Infinity;
        let bestC = 0;
        for (let c = 0; c < this.k; c++) {
          const dist = this.euclideanDistance(vectors[i], this.centroids[c]);
          if (dist < minDist) {
            minDist = dist;
            bestC = c;
          }
        }
        assignments[i] = bestC;
      }

      // Recompute centroids
      for (let c = 0; c < this.k; c++) {
        const clusterVectors = vectors.filter((_, idx) => assignments[idx] === c);
        if (clusterVectors.length > 0) {
          for (let d = 0; d < dims; d++) {
            this.centroids[c][d] = clusterVectors.reduce((sum, v) => sum + v[d], 0) / clusterVectors.length;
          }
        }
      }
    }

    // Map clusters to meaningful names based on centroid profiles
    const summaries: ClusterSummary[] = [];
    for (let c = 0; c < this.k; c++) {
      const clusterStudents = data.filter((_, idx) => assignments[idx] === c);
      const count = clusterStudents.length;

      const avgCgpa = count > 0 ? clusterStudents.reduce((a, s) => a + s.cgpa, 0) / count : 0;
      const avgCoding = count > 0 ? clusterStudents.reduce((a, s) => a + s.coding_score, 0) / count : 0;
      const avgAptitude = count > 0 ? clusterStudents.reduce((a, s) => a + s.aptitude_score, 0) / count : 0;
      const avgComm = count > 0 ? clusterStudents.reduce((a, s) => a + s.communication_score, 0) / count : 0;
      const placedCount = clusterStudents.filter(s => s.placement_status === 1).length;
      const placementRate = count > 0 ? (placedCount / count) * 100 : 0;

      // Assign descriptive cluster label
      let name = this.clusterNames[c];
      let description = '';

      if (avgCgpa >= 8.2 && avgCoding >= 78) {
        name = 'Placement Ready';
        description = 'High academic and technical competencies across all domain areas.';
      } else if (avgCgpa >= 7.5 && avgCoding >= 68) {
        name = 'Nearly Ready';
        description = 'Solid baseline skills requiring targeted mock interviews & project polish.';
      } else if (avgCoding < 65 && avgAptitude >= 70) {
        name = 'Needs Technical Improvement';
        description = 'Strong general aptitude but requires focused coding & DSA practice.';
      } else if (avgAptitude < 65 && avgCoding >= 70) {
        name = 'Needs Aptitude Improvement';
        description = 'Good coding ability needing numerical & logical reasoning practice.';
      } else if (avgComm < 65) {
        name = 'Needs Communication Improvement';
        description = 'Strong technical fundamentals needing verbal & interview confidence training.';
      } else {
        name = 'High Intervention Need';
        description = 'Multiple skill deficits requiring structured 4-week mentoring roadmap.';
      }

      summaries.push({
        clusterId: c,
        name,
        count,
        avgCgpa: Number(avgCgpa.toFixed(2)),
        avgCoding: Number(avgCoding.toFixed(1)),
        avgAptitude: Number(avgAptitude.toFixed(1)),
        avgComm: Number(avgComm.toFixed(1)),
        placementRate: Number(placementRate.toFixed(1)),
        description
      });
    }

    return summaries;
  }

  assignCluster(s: StudentFeatureVector): string {
    if (this.centroids.length === 0) return 'Unassigned';
    const vec = this.extractVector(s);
    let minDist = Infinity;
    let bestC = 0;
    for (let c = 0; c < this.centroids.length; c++) {
      const dist = this.euclideanDistance(vec, this.centroids[c]);
      if (dist < minDist) {
        minDist = dist;
        bestC = c;
      }
    }
    return this.clusterNames[bestC] || 'Unassigned';
  }
}
