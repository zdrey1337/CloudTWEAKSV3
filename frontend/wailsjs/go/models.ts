export namespace main {
	
	export class CloudAIChatMessage {
	    role: string;
	    content: string;
	
	    static createFrom(source: any = {}) {
	        return new CloudAIChatMessage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.role = source["role"];
	        this.content = source["content"];
	    }
	}
	export class SystemStats {
	    cpuUsage: number;
	    memoryUsage: number;
	    memoryUsed: number;
	    memoryTotal: number;
	    cpuCount: number;
	    performance: number;
	    os: string;
	    architecture: string;
	    uptime: number;
	
	    static createFrom(source: any = {}) {
	        return new SystemStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cpuUsage = source["cpuUsage"];
	        this.memoryUsage = source["memoryUsage"];
	        this.memoryUsed = source["memoryUsed"];
	        this.memoryTotal = source["memoryTotal"];
	        this.cpuCount = source["cpuCount"];
	        this.performance = source["performance"];
	        this.os = source["os"];
	        this.architecture = source["architecture"];
	        this.uptime = source["uptime"];
	    }
	}
	export class CloudAIChatRequest {
	    message: string;
	    history: CloudAIChatMessage[];
	    systemStats?: SystemStats;
	
	    static createFrom(source: any = {}) {
	        return new CloudAIChatRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.message = source["message"];
	        this.history = this.convertValues(source["history"], CloudAIChatMessage);
	        this.systemStats = this.convertValues(source["systemStats"], SystemStats);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CloudAIChatResult {
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new CloudAIChatResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.message = source["message"];
	    }
	}
	export class CloudAIRecommendation {
	    id: string;
	    name: string;
	    description: string;
	    reason: string;
	    compatibility: string;
	    risk: string;
	
	    static createFrom(source: any = {}) {
	        return new CloudAIRecommendation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.reason = source["reason"];
	        this.compatibility = source["compatibility"];
	        this.risk = source["risk"];
	    }
	}
	export class CloudAIRequest {
	    cpu: string;
	    gpu: string;
	    ram: string;
	    motherboard: string;
	    windows: string;
	    storage: string;
	    mainGame: string;
	    goal: string;
	    additional: string;
	
	    static createFrom(source: any = {}) {
	        return new CloudAIRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cpu = source["cpu"];
	        this.gpu = source["gpu"];
	        this.ram = source["ram"];
	        this.motherboard = source["motherboard"];
	        this.windows = source["windows"];
	        this.storage = source["storage"];
	        this.mainGame = source["mainGame"];
	        this.goal = source["goal"];
	        this.additional = source["additional"];
	    }
	}
	export class CloudAIResult {
	    summary: string;
	    systemAssessment: string;
	    recommendations: CloudAIRecommendation[];
	    warnings: string[];
	    notRecommended: CloudAIRecommendation[];
	
	    static createFrom(source: any = {}) {
	        return new CloudAIResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.summary = source["summary"];
	        this.systemAssessment = source["systemAssessment"];
	        this.recommendations = this.convertValues(source["recommendations"], CloudAIRecommendation);
	        this.warnings = source["warnings"];
	        this.notRecommended = this.convertValues(source["notRecommended"], CloudAIRecommendation);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

