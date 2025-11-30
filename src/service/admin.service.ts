import { ApiService } from "@/service/base.service";
import {
  buildQueryString,
  resolveServiceCall,
  type QueryValue,
} from "@/service/service-helpers";
import type { ServiceResponse } from "@/types/service";

type Payload = Record<string, unknown>;

class AdminService extends ApiService {
  private readonly basePath = "admin";

  private path(resource: string, id?: string): string {
    return id
      ? `${this.basePath}/${resource}/${id}`
      : `${this.basePath}/${resource}`;
  }

  listRtoProfiles(
    params: Record<string, QueryValue> = {},
  ): Promise<ServiceResponse<unknown>> {
    const query = buildQueryString(params);
    return resolveServiceCall<unknown>(
      () => this.get(`${this.path("rto-profiles")}${query}`, true),
      "RTO profiles fetched.",
      "Failed to fetch RTO profiles",
    );
  }

  createRtoProfile(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(this.path("rto-profiles"), payload, true),
      "RTO profile created.",
      "Failed to create RTO profile",
    );
  }

  getRtoProfile(rtoId: string): Promise<ServiceResponse<unknown>> {
    if (!rtoId) throw new Error("RTO id is required");
    return resolveServiceCall<unknown>(
      () => this.get(this.path("rto-profiles", rtoId), true),
      "RTO profile fetched.",
      "Failed to fetch RTO profile",
    );
  }

  updateRtoProfile(
    rtoId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!rtoId) throw new Error("RTO id is required");
    return resolveServiceCall<unknown>(
      () => this.patch(this.path("rto-profiles", rtoId), payload, true),
      "RTO profile updated.",
      "Failed to update RTO profile",
    );
  }

  deleteRtoProfile(rtoId: string): Promise<ServiceResponse<unknown>> {
    if (!rtoId) throw new Error("RTO id is required");
    return resolveServiceCall<unknown>(
      () => this.delete(this.path("rto-profiles", rtoId), true),
      "RTO profile deleted.",
      "Failed to delete RTO profile",
    );
  }

  listDocumentTypes(
    params: Record<string, QueryValue> = {},
  ): Promise<ServiceResponse<unknown>> {
    const query = buildQueryString(params);
    return resolveServiceCall<unknown>(
      () => this.get(`${this.path("document-types")}${query}`, true),
      "Document types fetched.",
      "Failed to fetch document types",
    );
  }

  createDocumentType(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(this.path("document-types"), payload, true),
      "Document type created.",
      "Failed to create document type",
    );
  }

  getDocumentType(docTypeId: string): Promise<ServiceResponse<unknown>> {
    if (!docTypeId) throw new Error("Document type id is required");
    return resolveServiceCall<unknown>(
      () => this.get(this.path("document-types", docTypeId), true),
      "Document type fetched.",
      "Failed to fetch document type",
    );
  }

  updateDocumentType(
    docTypeId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!docTypeId) throw new Error("Document type id is required");
    return resolveServiceCall<unknown>(
      () => this.patch(this.path("document-types", docTypeId), payload, true),
      "Document type updated.",
      "Failed to update document type",
    );
  }

  deleteDocumentType(docTypeId: string): Promise<ServiceResponse<unknown>> {
    if (!docTypeId) throw new Error("Document type id is required");
    return resolveServiceCall<unknown>(
      () => this.delete(this.path("document-types", docTypeId), true),
      "Document type deleted.",
      "Failed to delete document type",
    );
  }

  listStaff(
    params: Record<string, QueryValue> = {},
  ): Promise<ServiceResponse<unknown>> {
    const query = buildQueryString(params);
    return resolveServiceCall<unknown>(
      () => this.get(`${this.path("staff")}${query}`, true),
      "Staff list fetched.",
      "Failed to fetch staff",
    );
  }

  createStaff(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(this.path("staff"), payload, true),
      "Staff created.",
      "Failed to create staff",
    );
  }

  getStaff(staffId: string): Promise<ServiceResponse<unknown>> {
    if (!staffId) throw new Error("Staff id is required");
    return resolveServiceCall<unknown>(
      () => this.get(this.path("staff", staffId), true),
      "Staff fetched.",
      "Failed to fetch staff",
    );
  }

  updateStaff(
    staffId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!staffId) throw new Error("Staff id is required");
    return resolveServiceCall<unknown>(
      () => this.put(this.path("staff", staffId), payload, true),
      "Staff updated.",
      "Failed to update staff",
    );
  }

  deactivateStaff(staffId: string): Promise<ServiceResponse<unknown>> {
    if (!staffId) throw new Error("Staff id is required");
    return resolveServiceCall<unknown>(
      () => this.patch(`${this.path("staff", staffId)}/deactivate`, {}, true),
      "Staff deactivated.",
      "Failed to deactivate staff",
    );
  }

  activateStaff(staffId: string): Promise<ServiceResponse<unknown>> {
    if (!staffId) throw new Error("Staff id is required");
    return resolveServiceCall<unknown>(
      () => this.patch(`${this.path("staff", staffId)}/activate`, {}, true),
      "Staff activated.",
      "Failed to activate staff",
    );
  }

  listAgents(
    params: Record<string, QueryValue> = {},
  ): Promise<ServiceResponse<unknown>> {
    const query = buildQueryString(params);
    return resolveServiceCall<unknown>(
      () => this.get(`${this.path("agents")}${query}`, true),
      "Agents fetched.",
      "Failed to fetch agents",
    );
  }

  createAgent(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(this.path("agents"), payload, true),
      "Agent created.",
      "Failed to create agent",
    );
  }

  getAgent(agentId: string): Promise<ServiceResponse<unknown>> {
    if (!agentId) throw new Error("Agent id is required");
    return resolveServiceCall<unknown>(
      () => this.get(this.path("agents", agentId), true),
      "Agent fetched.",
      "Failed to fetch agent",
    );
  }

  updateAgent(
    agentId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!agentId) throw new Error("Agent id is required");
    return resolveServiceCall<unknown>(
      () => this.put(this.path("agents", agentId), payload, true),
      "Agent updated.",
      "Failed to update agent",
    );
  }

  deactivateAgent(agentId: string): Promise<ServiceResponse<unknown>> {
    if (!agentId) throw new Error("Agent id is required");
    return resolveServiceCall<unknown>(
      () => this.patch(`${this.path("agents", agentId)}/deactivate`, {}, true),
      "Agent deactivated.",
      "Failed to deactivate agent",
    );
  }

  activateAgent(agentId: string): Promise<ServiceResponse<unknown>> {
    if (!agentId) throw new Error("Agent id is required");
    return resolveServiceCall<unknown>(
      () => this.patch(`${this.path("agents", agentId)}/activate`, {}, true),
      "Agent activated.",
      "Failed to activate agent",
    );
  }

  listCourses(
    params: Record<string, QueryValue> = {},
  ): Promise<ServiceResponse<unknown>> {
    const query = buildQueryString(params);
    return resolveServiceCall<unknown>(
      () => this.get(`${this.path("courses")}${query}`, true),
      "Courses fetched.",
      "Failed to fetch courses",
    );
  }

  createCourse(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(this.path("courses"), payload, true),
      "Course created.",
      "Failed to create course",
    );
  }

  getCourse(courseId: string): Promise<ServiceResponse<unknown>> {
    if (!courseId) throw new Error("Course id is required");
    return resolveServiceCall<unknown>(
      () => this.get(this.path("courses", courseId), true),
      "Course fetched.",
      "Failed to fetch course",
    );
  }

  updateCourse(
    courseId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!courseId) throw new Error("Course id is required");
    return resolveServiceCall<unknown>(
      () => this.patch(this.path("courses", courseId), payload, true),
      "Course updated.",
      "Failed to update course",
    );
  }

  deleteCourse(courseId: string): Promise<ServiceResponse<unknown>> {
    if (!courseId) throw new Error("Course id is required");
    return resolveServiceCall<unknown>(
      () => this.delete(this.path("courses", courseId), true),
      "Course deleted.",
      "Failed to delete course",
    );
  }

  listCampuses(
    params: Record<string, QueryValue> = {},
  ): Promise<ServiceResponse<unknown>> {
    const query = buildQueryString(params);
    return resolveServiceCall<unknown>(
      () => this.get(`${this.path("campuses")}${query}`, true),
      "Campuses fetched.",
      "Failed to fetch campuses",
    );
  }

  createCampus(payload: Payload): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.post(this.path("campuses"), payload, true),
      "Campus created.",
      "Failed to create campus",
    );
  }

  getCampus(campusId: string): Promise<ServiceResponse<unknown>> {
    if (!campusId) throw new Error("Campus id is required");
    return resolveServiceCall<unknown>(
      () => this.get(this.path("campuses", campusId), true),
      "Campus fetched.",
      "Failed to fetch campus",
    );
  }

  updateCampus(
    campusId: string,
    payload: Payload,
  ): Promise<ServiceResponse<unknown>> {
    if (!campusId) throw new Error("Campus id is required");
    return resolveServiceCall<unknown>(
      () => this.patch(this.path("campuses", campusId), payload, true),
      "Campus updated.",
      "Failed to update campus",
    );
  }

  deleteCampus(campusId: string): Promise<ServiceResponse<unknown>> {
    if (!campusId) throw new Error("Campus id is required");
    return resolveServiceCall<unknown>(
      () => this.delete(this.path("campuses", campusId), true),
      "Campus deleted.",
      "Failed to delete campus",
    );
  }

  getStatus(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/status`, true),
      "System status fetched.",
      "Failed to fetch system status",
    );
  }

  getEnums(): Promise<ServiceResponse<unknown>> {
    return resolveServiceCall<unknown>(
      () => this.get(`${this.basePath}/enums`, true),
      "Enums fetched.",
      "Failed to fetch enums",
    );
  }
}

const adminService = new AdminService();
export default adminService;
