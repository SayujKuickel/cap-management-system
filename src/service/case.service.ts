/*
import { ApiService } from '@/services/base.service';
import { handleApiError } from '@/utils/handle-api-error';
import { ServiceResponse } from '@/types/service.types';
import { z } from 'zod';
import {
  CaseForm,
  CaseFormSchema,
  CaseFull,
  CaseFullSchema,
} from '@/lib/validation/case.validation';

const FetchCasesResponseSchema = z.object({
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
  cases: z.array(CaseFullSchema),
});
export type FetchCasesResponse = z.infer<typeof FetchCasesResponseSchema>;

const CaseStatusUpdateSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
});
export type CaseStatusUpdate = z.infer<typeof CaseStatusUpdateSchema>;

class CaseService extends ApiService {
  constructor() {
    super();
  }

  async fetchCases(
    query: string,
    page: number,
    perPage: number,
    isArchived?: boolean,
  ): Promise<ServiceResponse<FetchCasesResponse>> {
    const archived = isArchived ?? false;

    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (page && page > 1) params.set('page', String(page));
    if (perPage && perPage > 1) params.set('per_page', String(perPage));

    try {
      const url = `/cases${archived ? '/archived' : ''}${
        params.toString() ? `?${params.toString()}` : ''
      }`;

      const raw = await this.get<unknown>(url, true);
      const data = FetchCasesResponseSchema.parse(raw);

      return { data, success: true, message: 'Cases fetched!' };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch case list');
    }
  }

  // fetch item
  async fetchCase(id: string): Promise<ServiceResponse<CaseFull>> {
    if (!id) throw new Error('Please choose a Case to fetch');

    try {
      const raw = await this.get<unknown>(`/cases/${id}`, true);
      const data = CaseFullSchema.parse(raw);
      return { data, message: 'Case fetched!', success: true };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch case');
    }
  }

  async postCase(input: CaseForm): Promise<ServiceResponse<CaseFull>> {
    try {
      const body = CaseFormSchema.parse(input);
      const raw = await this.post<unknown>('/cases', body, true);
      const data = CaseFullSchema.parse((raw as any)?.data ?? raw);

      return { success: true, message: 'Case created!', data };
    } catch (error) {
      return handleApiError(error, 'Failed to create case');
    }
  }

  // edit
  async editCase(
    id: string,
    input: CaseForm,
  ): Promise<ServiceResponse<CaseFull>> {
    if (!id) throw new Error('Please choose a case to edit');

    try {
      const body = CaseFormSchema.parse(input);
      const raw = await this.put<unknown>(`/cases/${id}`, body, true);
      const data = CaseFullSchema.parse((raw as any)?.data ?? raw);
      return { success: true, message: 'Case edited!', data };
    } catch (error) {
      return handleApiError(error, 'Failed to edit case');
    }
  }

  async deleteCase(
    id: string,
    isArchived?: boolean,
  ): Promise<ServiceResponse<null>> {
    try {
      await this.delete<unknown>(
        `/cases/${id}${isArchived ? '/permanent' : ''}`,
        true,
      );
      return { success: true, message: 'Case deleted!', data: null };
    } catch (error) {
      return handleApiError(error, 'Failed to delete Case');
    }
  }

  async restoreCase(id: string): Promise<ServiceResponse<null>> {
    try {
      await this.patch<unknown>(`/cases/${id}/unarchive`, null, true);
      return {
        success: true,
        message: 'Case was restored successfully!',
        data: null,
      };
    } catch (error) {
      return handleApiError(error, 'Failed to restore Case');
    }
  }
}

export default new CaseService();

 */