/**
 * XORAS // Composite AST Integrity Sentry
 * Location: /lib/core/quantum_sentry.cjs
 * Purpose: Multi-algorithm cryptographic verification of AST runtime nodes and tool manifests.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CompositeIntegritySentry {
    constructor() {
        this.algorithm = 'sha512-256';
    }

    /**
     * Generates a composite SHA-512/256 hash of a file's structural contents.
     */
    generateNodeSignature(filePath) {
        if (!fs.existsSync(filePath)) return null;
        const content = fs.readFileSync(filePath);
        const h1 = crypto.createHash('sha256').update(content).digest('hex');
        const h2 = crypto.createHash('sha512').update(content).digest('hex');
        return crypto.createHash('sha512-256').update(h1 + h2).digest('hex');
    }

    /**
     * Generates a Merkle root manifest across a target directory.
     */
    buildManifest(targetDir, exclusions = ['node_modules', '.git', 'dist']) {
        const files = this._readDirRecursive(targetDir, exclusions);
        const manifest = new Map();

        files.forEach(f => {
            const sig = this.generateNodeSignature(f);
            if (sig) manifest.set(path.relative(targetDir, f), sig);
        });

        const sortedKeys = Array.from(manifest.keys()).sort();
        const combinedHashes = sortedKeys.map(k => manifest.get(k)).join('');
        const rootHash = crypto.createHash('sha512').update(combinedHashes).digest('hex');

        return { rootHash, totalNodes: manifest.size, nodes: Object.fromEntries(manifest) };
    }

    /**
     * Verifies an existing manifest against current runtime files.
     */
    verifyManifest(targetDir, expectedManifest) {
        const current = this.buildManifest(targetDir);
        const violations = [];

        if (current.rootHash !== expectedManifest.rootHash) {
            for (const [file, expectedSig] of Object.entries(expectedManifest.nodes)) {
                const actualSig = current.nodes[file];
                if (actualSig !== expectedSig) {
                    violations.push({ file, expectedSig, actualSig: actualSig || 'MISSING' });
                }
            }
        }

        return { verified: violations.length === 0, rootHash: current.rootHash, violations };
    }

    _readDirRecursive(dir, exclusions) {
        let results = [];
        if (!fs.existsSync(dir)) return results;
        if (exclusions.some(exc => dir.includes(exc))) return results;

        const list = fs.readdirSync(dir);
        list.forEach(file => {
            file = path.join(dir, file);
            try {
                const stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    results = results.concat(this._readDirRecursive(file, exclusions));
                } else if (file.match(/\.(js|cjs|mjs|ts|json|md)$/)) {
                    results.push(file);
                }
            } catch (e) {}
        });
        return results;
    }
}

module.exports = new CompositeIntegritySentry();
